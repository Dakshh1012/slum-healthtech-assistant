import { supabase } from '@/lib/supabase';
import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, Image, FlatList, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ArrowUp, ArrowDown, Award, Share2, MessageSquare, Bookmark, MoveHorizontal as MoreHorizontal, TrendingUp, Clock, Star } from 'lucide-react-native';
import TranslatedText from '@/components/TranslatedText';

// Define post type for TypeScript
type Post = {
  id: string;
  title: string;
  content: string;
  imageUri?: string;
  timestamp: Date;
  comments: Comment[];
  votes: number;
  awards: Award[];
  saved: boolean;
};

type Comment = {
  id: string;
  content: string;
  timestamp: Date;
  votes: number;
};

type Award = {
  id: string;
  name: string;
  icon: string;
};

type SortOption = 'hot' | 'new' | 'top';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('hot');



const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          image_uri,
          created_at,
          comments (
            id,
            content,
            created_at
          ),
          votes
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match frontend format
      const formattedPosts = data.map((post: any) => ({
        ...post,
        timestamp: new Date(post.created_at),
        imageUri: post.image_uri,
        comments: post.comments.map((comment: any) => ({
          ...comment,
          timestamp: new Date(comment.created_at)
        }))
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, []);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setNewPostImage(result.assets[0].uri);
    }
  };

  const handleCreatePost = () => {
    if (newPostTitle.trim() === '' || newPostContent.trim() === '') return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      imageUri: newPostImage || undefined,
      timestamp: new Date(),
      comments: [],
      votes: 0,
      awards: [],
      saved: false,
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImage(null);
    setPostModalVisible(false);
  };

  const handleVote = async (postId: string, value: number) => {
    try {
      const { data, error } = await supabase
        .rpc('increment_post_votes', { post_id: postId, value })
      
      if (error) throw error;
  
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, votes: data } 
          : post
      ));
    } catch (error) {
      console.error('Voting error:', error);
    }
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const handleCommentVote = (postId: string, commentId: string, value: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, votes: (comment.votes || 0) + value }
                : comment
            )
          }
        : post
    ));
  };

  const handleAddComment = () => {
    if (!selectedPost || newComment.trim() === '') return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      timestamp: new Date(),
      votes: 0,
    };
    
    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, comment],
    };
    
    setPosts(posts.map(post => post.id === selectedPost.id ? updatedPost : post));
    setSelectedPost(updatedPost);
    setNewComment('');
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatVotes = (votes: number): string => {
    if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}k`;
    }
    return votes.toString();
  };

  const sortPosts: (posts: Post[]) => Post[] = (posts: Post[]): Post[] => {
    switch (sortBy) {
      case 'hot':
        return [...posts].sort((a, b) => (b.votes + b.comments.length) - (a.votes + a.comments.length));
      case 'new':
        return [...posts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      case 'top':
        return [...posts].sort((a, b) => b.votes - a.votes);
      default:
        return posts;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TranslatedText textKey="Community" style={styles.title}/>
        <TouchableOpacity 
          style={styles.postButton}
          onPress={() => setPostModalVisible(true)}
        >
          <TranslatedText textKey='Create Post' style={styles.postButtonText}/>
        </TouchableOpacity>
      </View>

      <View style={styles.sortBar}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'hot' && styles.sortButtonActive]}
          onPress={() => setSortBy('hot')}
        >
          <TrendingUp size={16} color={sortBy === 'hot' ? '#008080' : '#666'} />
          <TranslatedText textKey='Hot' style={[styles.sortButtonText, sortBy === 'hot' && styles.sortButtonTextActive]}/>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'new' && styles.sortButtonActive]}
          onPress={() => setSortBy('new')}
        >
          <Clock size={16} color={sortBy === 'new' ? '#008080' : '#666'} />
          <TranslatedText textKey='New' style={[styles.sortButtonText, sortBy === 'new' && styles.sortButtonTextActive]}/>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'top' && styles.sortButtonActive]}
          onPress={() => setSortBy('top')}
        >
          <Star size={16} color={sortBy === 'top' ? '#008080' : '#666'} />
          <TranslatedText textKey='Top' style={[styles.sortButtonText, sortBy === 'top' && styles.sortButtonTextActive]}/>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={sortPosts(posts)}
        keyExtractor={(item) => item.id}
        style={styles.postsList}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.voteContainer}>
              <TouchableOpacity onPress={() => handleVote(item.id, 1)}>
                <ArrowUp size={20} color="#666" />
              </TouchableOpacity>
              <TranslatedText textKey={formatVotes(item.votes)} style={styles.voteCount}/>
              <TouchableOpacity onPress={() => handleVote(item.id, -1)}>
                <ArrowDown size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.postContent}>
              <TouchableOpacity 
                onPress={() => {
                  setSelectedPost(item);
                  setModalVisible(true);
                }}
              >
                <TranslatedText textKey={item.title} style={styles.postTitle}/>
                {item.imageUri && (
                  <Image source={{ uri: item.imageUri }} style={styles.postImage} />
                )}
                <TranslatedText textKey={item.content} style={styles.postText} numberOfLines={3}/>
                
                <View style={styles.postFooter}>
                  <View style={styles.postMeta}>
                    <TranslatedText textKey={formatDate(item.timestamp)} style={styles.postTime}/>
                    <View style={styles.postActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <MessageSquare size={16} color="#666" />
                        <TranslatedText textKey={item.comments.length.toString()} style={styles.actionText}/>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Share2 size={16} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleSave(item.id)}
                      >
                        <Bookmark 
                          size={16} 
                          color={item.saved ? '#008080' : '#666'}
                          fill={item.saved ? '#008080' : 'none'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <MoreHorizontal size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <TranslatedText textKey="No posts yet. Be the first to share!" style={styles.emptyText} />
          </View>
        }
      />
      
      {/* Create Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={postModalVisible}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TranslatedText textKey="Create a Post" style={styles.modalTitle} />
            
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="What are your thoughts?"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.imagePickerContainer}>
              {newPostImage ? (
                <Image source={{ uri: newPostImage }} style={styles.previewImage} />
              ) : null}
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <TranslatedText textKey={newPostImage ? "Change Image" : "Add Image"} style={styles.imageButtonText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setPostModalVisible(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                  setNewPostImage(null);
                }}
              >
                <TranslatedText textKey="Cancel" style={styles.buttonText} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleCreatePost}
              >
                <TranslatedText textKey="Post" style={styles.buttonText} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Post Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible && selectedPost !== null}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedPost && (
              <>
                <View style={styles.modalHeader}>
                  <TranslatedText textKey={selectedPost.title} style={styles.modalTitle} />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <TranslatedText textKey="×" style={styles.closeButtonText} />
                  </TouchableOpacity>
                </View>
                
                {selectedPost.imageUri && (
                  <Image source={{ uri: selectedPost.imageUri }} style={styles.detailImage} />
                )}
                
                <TranslatedText textKey={selectedPost.content} style={styles.detailContent} />
                <TranslatedText textKey={formatDate(selectedPost.timestamp)} style={styles.detailTime} />
                
                <View style={styles.commentsSection}>
                  <TranslatedText textKey="Comments" style={styles.commentsHeader} />
                  
                  <FlatList
                    data={selectedPost.comments}
                    keyExtractor={(item) => item.id}
                    style={styles.commentsList}
                    renderItem={({ item }) => (
                      <View style={styles.commentItem}>
                        <View style={styles.commentVoteContainer}>
                          <TouchableOpacity onPress={() => handleCommentVote(selectedPost.id, item.id, 1)}>
                            <ArrowUp size={16} color="#666" />
                          </TouchableOpacity>
                          <TranslatedText textKey={formatVotes(item.votes || 0)} style={styles.commentVoteCount} />
                          <TouchableOpacity onPress={() => handleCommentVote(selectedPost.id, item.id, -1)}>
                            <ArrowDown size={16} color="#666" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.commentContent}>
                          <TranslatedText textKey={item.content} style={styles.commentText} />
                          <TranslatedText textKey={formatDate(item.timestamp)} style={styles.commentTime} />
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={
                      <TranslatedText textKey="No comments yet. Be the first!" style={styles.noComments} />
                    }
                  />
                  
                  <View style={styles.addCommentContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                    />
                    <TouchableOpacity 
                      style={styles.commentButton}
                      onPress={handleAddComment}
                    >
                      <TranslatedText textKey="Comment" style={styles.commentButtonText} />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008080',
  },
  sortBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  sortButtonActive: {
    backgroundColor: '#e6f3f3',
  },
  sortButtonText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: '#008080',
  },
  postButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  postsList: {
    flex: 1,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  voteContainer: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  voteCount: {
    marginVertical: 4,
    fontWeight: '600',
    color: '#1a1a1b',
  },
  postContent: {
    flex: 1,
    padding: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1b',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 8,
  },
  postText: {
    fontSize: 14,
    color: '#1a1a1b',
    marginBottom: 8,
  },
  postFooter: {
    marginTop: 8,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 12,
    color: '#787c7e',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    padding: 4,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#787c7e',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#787c7e',
    fontSize: 14,
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1b',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#787c7e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  imagePickerContainer: {
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 8,
  },
  imageButton: {
    backgroundColor: '#008080',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  submitButton: {
    backgroundColor: '#008080',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 20,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1a1a1b',
  },
  commentsList: {
    maxHeight: '60%',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentVoteContainer: {
    alignItems: 'center',
    paddingRight: 8,
  },
  commentVoteCount: {
    fontSize: 12,
    color: '#1a1a1b',
    marginVertical: 2,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    color: '#1a1a1b',
  },
  commentTime: {
    fontSize: 12,
    color: '#787c7e',
    marginTop: 4,
  },
  noComments: {
    color: '#787c7e',
    textAlign: 'center',
    padding: 20,
  },
  addCommentContainer: {
    marginTop: 15,
    flexDirection: 'row',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f8f9fa',
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  detailContent: {
    fontSize: 14,
    color: '#1a1a1b',
    marginBottom: 8,
  },
  detailTime: {
    fontSize: 12,
    color: '#787c7e',
    marginTop: 4,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 8,
  },
  commentButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});