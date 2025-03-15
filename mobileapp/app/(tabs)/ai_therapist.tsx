import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Image, FlatList, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

// Define post type for TypeScript
type Post = {
  id: string;
  title: string;
  content: string;
  imageUri?: string;
  timestamp: Date;
  comments: Comment[];
};

type Comment = {
  id: string;
  content: string;
  timestamp: Date;
};

export default function AITherapistScreen() {
  // State for posts and selected post
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  
  // State for new post form
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  
  // State for comments
  const [newComment, setNewComment] = useState('');

  // Pick image from gallery
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

  // Create a new post
  const handleCreatePost = () => {
    if (newPostTitle.trim() === '' || newPostContent.trim() === '') {
      return; // Don't create empty posts
    }
    
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      imageUri: newPostImage || undefined,
      timestamp: new Date(),
      comments: [],
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImage(null);
    setPostModalVisible(false);
  };

  // Add a comment to a post
  const handleAddComment = () => {
    if (!selectedPost || newComment.trim() === '') return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      timestamp: new Date(),
    };
    
    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, comment],
    };
    
    setPosts(posts.map(post => post.id === selectedPost.id ? updatedPost : post));
    setSelectedPost(updatedPost);
    setNewComment('');
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Post Button */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity 
          style={styles.postButton}
          onPress={() => setPostModalVisible(true)}
        >
          <Text style={styles.postButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>
      
      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        style={styles.postsList}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.postCard}
            onPress={() => {
              setSelectedPost(item);
              setModalVisible(true);
            }}
          >
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.postImage} />
            )}
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>{item.content}</Text>
            <Text style={styles.postTime}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.commentsCount}>{item.comments.length} comments</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
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
            <Text style={styles.modalTitle}>Create a New Post</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Share your thoughts..."
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
                <Text style={styles.imageButtonText}>
                  {newPostImage ? "Change Image" : "Add Image"}
                </Text>
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
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleCreatePost}
              >
                <Text style={styles.buttonText}>Post</Text>
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
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                
                {selectedPost.imageUri && (
                  <Image source={{ uri: selectedPost.imageUri }} style={styles.detailImage} />
                )}
                
                <Text style={styles.detailContent}>{selectedPost.content}</Text>
                <Text style={styles.detailTime}>{formatDate(selectedPost.timestamp)}</Text>
                
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsHeader}>Comments</Text>
                  
                  <FlatList
                    data={selectedPost.comments}
                    keyExtractor={(item) => item.id}
                    style={styles.commentsList}
                    renderItem={({ item }) => (
                      <View style={styles.commentItem}>
                        <Text style={styles.commentContent}>{item.content}</Text>
                        <Text style={styles.commentTime}>{formatDate(item.timestamp)}</Text>
                      </View>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                    }
                  />
                  
                  <View style={styles.addCommentContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChangeText={setNewComment}
                    />
                    <TouchableOpacity 
                      style={styles.commentButton}
                      onPress={handleAddComment}
                    >
                      <Text style={styles.commentButtonText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
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
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  postButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postsList: {
    flex: 1,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  postTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  commentsCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailTime: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  imageButtonText: {
    color: 'white',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
  },
  closeButton: {
    backgroundColor: '#ccc',
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  commentsSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  commentsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentsList: {
    maxHeight: 200,
  },
  commentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentContent: {
    fontSize: 14,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  noComments: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: '#4a90e2',
    padding: 8,
    borderRadius: 5,
    justifyContent: 'center',
  },
  commentButtonText: {
    color: 'white',
  },
});