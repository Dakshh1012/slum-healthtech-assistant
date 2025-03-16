"use client"

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/global/DashboardHeader';
import { RequestCard } from '@/components/global/RequestCard';
import { useRequestFilter } from '@/hooks/use-request-filter';
import { useRequests } from '@/hooks/use-requests';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const { requests, loading, error, updateRequestStatus } = useRequests();
  const { filter, setFilter, filteredRequests, counts } = useRequestFilter(requests as any);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    cause: '',
    description: '',
    address: ''
  });

  const handleUpdateStatus = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    const success = await updateRequestStatus(requestId, newStatus);
    if (success) {
      toast(
        newStatus === 'accepted' ? 'Request accepted' : 'Request rejected', 
        { 
          description: `Request ID: ${requestId.slice(0, 8)}`,
          position: 'bottom-right'
        }
      );
    } else {
      toast.error('Failed to update request status', {
        description: 'Please try again later',
        position: 'bottom-right'
      });
    }
  };

  const handleNotificationSubmit = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification]);

      if (error) throw error;

      toast.success('Notification created successfully');
      setIsNotifyModalOpen(false);
      setNotification({ title: '', cause: '', description: '', address: '' });
    } catch (error) {
      toast.error('Failed to create notification');
      console.error('Error:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-lg shadow-sm border">
          <p className="text-lg text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        filter={filter} 
        onFilterChange={setFilter} 
        requestsCount={counts.all}
        onNotify={() => setIsNotifyModalOpen(true)}
      />
      
      <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>
              Send a new notification to all users
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                value={notification.title}
                onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="cause">Cause</label>
              <Input
                id="cause"
                value={notification.cause}
                onChange={(e) => setNotification(prev => ({ ...prev, cause: e.target.value }))}
                placeholder="Notification cause"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={notification.description}
                onChange={(e) => setNotification(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address">Address</label>
              <Input
                id="address"
                value={notification.address}
                onChange={(e) => setNotification(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Location address"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNotifyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNotificationSubmit}>
              Send Notification
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 md:gap-6">
          {loading ? (
            <div className="text-center p-12 bg-white rounded-lg shadow-sm border">
              <p className="text-lg text-muted-foreground">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-lg shadow-sm border">
              <p className="text-lg text-muted-foreground">No requests found for this filter.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;