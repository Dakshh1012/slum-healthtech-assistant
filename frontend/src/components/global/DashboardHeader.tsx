import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const FilterButton = ({ active, onClick, children, className }: FilterButtonProps) => (
  <Button
    variant={active ? "secondary" : "ghost"}
    onClick={onClick}
    className={cn(
      "status-filter-button",
      active ? "bg-white shadow-sm" : "bg-white/10 text-white hover:bg-white/20",
      className
    )}
  >
    {children}
  </Button>
);

interface DashboardHeaderProps {
  filter: string;
  onFilterChange: (value: string) => void;
  requestsCount: number;
  onNotify: () => void;
}

export const DashboardHeader = ({ filter, onFilterChange, requestsCount }: DashboardHeaderProps) => {
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    cause: '',
    description: '',
    address: ''
  });

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

  const filters = [
    { id: 'all', label: 'All Requests', icon: null },
    { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
    { id: 'accepted', label: 'Accepted', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'rejected', label: 'Rejected', icon: <XCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-gradient-to-br from-primary to-primary/90 text-white py-10 px-6 md:px-8 rounded-b-3xl shadow-md mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium animate-pulse-soft">
              {requestsCount} Active Requests
            </div>
            <h1 className="text-3xl font-bold">Assistance Dashboard</h1>
            <p className="text-white/80 max-w-lg">
              Manage and respond to assistance requests from communities in need
            </p>
          </div>
      
        </div>

        <div className="mt-8 flex overflow-x-auto pb-1">
          <div className="flex gap-2 md:gap-3">
            {filters.map((item) => (
              <FilterButton
                key={item.id}
                active={filter === item.id}
                onClick={() => onFilterChange(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
                {filter === item.id && (
                  <span className="ml-1.5 bg-primary/20 text-xs py-0.5 px-1.5 rounded-full">
                    {item.id === 'all' 
                      ? requestsCount 
                      : requestsCount}
                  </span>
                )}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="mt-8 flex overflow-x-auto pb-1">
          <div className="flex gap-2 md:gap-3">
            <Button onClick={() => setIsNotifyModalOpen(true)}>
              Create Notification
            </Button>
          </div>
        </div>
      </div>

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
                placeholder="Notification description"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address">Address</label>
              <Input
                id="address"
                value={notification.address}
                onChange={(e) => setNotification(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Notification address"
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
    </div>
  );
};