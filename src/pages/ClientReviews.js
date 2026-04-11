import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [responding, setResponding] = useState(null);
  const [responseDraft, setResponseDraft] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/client/reviews').then(r => setReviews(r.data)).catch(() => {});
  }, []);

  const handleResponseAssist = async (review) => {
    setResponding(review.id);
    setGenerating(true);
    try {
      const { data } = await api.post('/ai/response-assist', { review_text: review.text, rating: review.rating, category: 'General' });
      setResponseDraft(data.response_draft);
    } catch {
      toast.error('Failed to generate response');
    } finally {
      setGenerating(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseDraft);
    toast.success('Response copied to clipboard');
  };

  return (
    <div className="p-6 space-y-6" data-testid="client-reviews-page">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">Reviews</h1>
        <p className="text-sm text-zinc-500 mt-1">Unified review feed with AI response assistant</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="rounded-sm border-zinc-200 shadow-none">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-zinc-500">No reviews yet</p>
            </CardContent>
          </Card>
        ) : reviews.map(review => (
          <Card key={review.id} className="rounded-sm border-zinc-200 shadow-none" data-testid={`review-card-${review.id}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge className="rounded-sm bg-zinc-100 text-zinc-600 text-xs hover:bg-zinc-100">{review.source}</Badge>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">{review.author}</span>
                </div>
                <span className="text-xs text-zinc-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed mb-4">{review.text}</p>

              {responding === review.id ? (
                <div className="space-y-3 p-4 bg-zinc-50 border border-zinc-200 rounded-sm" data-testid={`response-area-${review.id}`}>
                  <p className="text-xs uppercase tracking-[0.15em] font-bold text-zinc-400">AI Response Draft</p>
                  {generating ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-[#002FA7]" />
                      <span className="text-sm text-zinc-500">Generating response...</span>
                    </div>
                  ) : (
                    <>
                      <Textarea value={responseDraft} onChange={e => setResponseDraft(e.target.value)} className="rounded-sm min-h-[80px] text-sm" data-testid={`response-draft-${review.id}`} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={copyResponse} className="rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white" data-testid={`copy-response-${review.id}`}>
                          <Copy className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} /> Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setResponding(null); setResponseDraft(''); }} className="rounded-sm">
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResponseAssist(review)}
                  className="rounded-sm text-[#002FA7] border-[#002FA7]/20 hover:bg-[#002FA7]/5"
                  data-testid={`respond-button-${review.id}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} /> AI Response
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
