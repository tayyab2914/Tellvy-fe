import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, Check, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ReviewPage() {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const memberName = searchParams.get('member') || '';
  const memberId = searchParams.get('member_id') || '';
  const category = searchParams.get('category') || 'General';
  const redirectUrl = searchParams.get('redirect') || '';

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    axios.get(`${API}/ai/tags/${category}`)
      .then(r => setTags(r.data.tags || []))
      .catch(() => setTags(['Professional', 'Efficient', 'Friendly', 'Helpful', 'Excellent']));
  }, [category]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleMagicWrite = async () => {
    if (selectedTags.length === 0) {
      toast.error('Select at least one quality tag');
      return;
    }
    setGenerating(true);
    try {
      const { data } = await axios.post(`${API}/ai/magic-write`, {
        member_name: memberName,
        tags: selectedTags,
        category: category
      });
      setDraft(data.review_draft);
    } catch {
      toast.error('Failed to generate review');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    toast.success('Review copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToReview = async () => {
    if (rating > 0 && rating < 4 && !alertSent) {
      try {
        await axios.post(`${API}/portal/low-rating-alert`, {
          client_id: clientId,
          member_id: memberId,
          member_name: memberName,
          rating,
        });
        setAlertSent(true);
      } catch {}
    }
    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="review-page">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://static.prod-images.emergentagent.com/jobs/d2ed1487-14a4-4fc1-8e2b-3d8f6aaf654d/images/a3e0b2130b485bc9bbe242cae0bab2b7c522b549d1955c31a2b1627d78900940.png"
              alt="Tellvy"
              className="w-6 h-6"
            />
            <span className="text-sm text-zinc-400">Powered by Tellvy</span>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-sm text-zinc-500 hover:text-[#09090B] flex items-center gap-1"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 space-y-8">
        {/* Member Acknowledgement */}
        <div className="text-center">
          <p className="text-sm text-zinc-500 mb-1">You selected</p>
          <h1 className="font-heading text-2xl tracking-tight font-medium text-[#09090B]">{memberName}</h1>
          <p className="text-sm text-zinc-400 mt-1">Help us leave a review!</p>
        </div>

        {/* Star Rating */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 mb-3">Rate your experience</p>
          <div className="flex items-center gap-1" data-testid="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-4xl leading-none transition-transform hover:scale-110 focus:outline-none"
                data-testid={`star-${star}`}
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
              >
                <span className={star <= (hoveredRating || rating) ? 'text-amber-400' : 'text-zinc-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {(hoveredRating || rating) > 0 && (
            <p className="text-sm text-zinc-500 mt-2">
              {RATING_LABELS[hoveredRating || rating]}
            </p>
          )}
        </div>

        {/* Tag Selection */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 mb-3">How was your experience?</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 text-sm rounded-sm border transition-all duration-150 ${
                  selectedTags.includes(tag)
                    ? 'bg-[#002FA7] text-white border-[#002FA7]'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#002FA7]/50'
                }`}
                data-testid={`tag-${tag.toLowerCase()}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Magic Write Button */}
        <Button
          onClick={handleMagicWrite}
          disabled={generating || selectedTags.length === 0}
          className="w-full h-12 rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white text-sm font-medium border-2 border-[#002FA7] shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
          data-testid="magic-write-button"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Writing...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} /> Magic Write</>
          )}
        </Button>

        {/* Generated Draft */}
        {draft && (
          <div className="space-y-4" data-testid="review-draft-area">
            <div className="p-5 bg-white border border-zinc-200 rounded-sm">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 mb-3">Your Review Draft</p>
              <p className="text-base text-[#09090B] leading-relaxed">{draft}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCopy}
                className="flex-1 rounded-sm bg-[#09090B] hover:bg-zinc-800 text-white"
                data-testid="copy-review-button"
              >
                {copied ? <><Check className="w-4 h-4 mr-2" strokeWidth={1.5} /> Copied!</> : <><Copy className="w-4 h-4 mr-2" strokeWidth={1.5} /> Copy to Clipboard</>}
              </Button>
              {redirectUrl && (
                <Button
                  onClick={handleGoToReview}
                  variant="outline"
                  className="rounded-sm border-[#002FA7]/20 text-[#002FA7] hover:bg-[#002FA7]/5"
                  data-testid="go-to-review-button"
                >
                  <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} /> Leave Review
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
