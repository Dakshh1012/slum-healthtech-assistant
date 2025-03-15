
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Image, AudioLines, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import type { Request } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: Request;
  onUpdateStatus: (id: string, status: 'accepted' | 'rejected') => void;
}

export const RequestCard = ({ request, onUpdateStatus }: RequestCardProps) => {
  return (
    <Card className="overflow-hidden hover-lift animate-scale-in">
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.severity} />
          <span className="text-sm text-muted-foreground flex items-center gap-1.5 ml-auto">
            <Clock className="w-4 h-4" />
            {format(new Date(request.created_at), 'PPp')}
          </span>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-medium leading-relaxed text-foreground">{request.message}</h3>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{request.address}</span>
          </div>
        </div>

        {request.media.length > 0 && (
          <div className="pt-2">
            <div className="flex flex-wrap gap-3">
              {request.media.map((media) => (
                <div key={media.id} className="relative group">
                  {media.media_url.includes('.mp3') ? (
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border",
                      "bg-accent/50 hover:bg-accent transition-colors duration-300"
                    )}>
                      <AudioLines className="w-5 h-5 text-primary" />
                      <audio 
                        controls 
                        src={media.media_url} 
                        className="h-8 w-[200px]" 
                      />
                    </div>
                  ) : (
                    <div className="media-preview h-24 w-32 group">
                      <div className="relative w-full h-full overflow-hidden rounded-lg">
                        <img
                          src={media.media_url}
                          alt="Request media"
                          className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                          <div className="flex items-center gap-1.5 text-white text-xs">
                            <Image className="w-3.5 h-3.5" />
                            <span>View</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {request.status === 'pending' && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onUpdateStatus(request.id, 'accepted')}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </Button>
            <Button
              onClick={() => onUpdateStatus(request.id, 'rejected')}
              variant="outline"
              className="flex-1 gap-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-all duration-300"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};