import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ExternalLink, Loader2, ArrowLeft, MessageSquare, Send, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// For low (1-3 star) ratings the tag buttons switch from positive qualities to
// critical areas of improvement, so the customer flags what fell short instead.
const CRITIQUE_TAGS = ['Rough', 'Unprofessional', 'Painful', 'Dirty', 'Slow'];

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
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // 1-3 stars is treated as a low rating: constructive tone + private feedback focus.
  const isLowRating = rating > 0 && rating < 4;

  useEffect(() => {
    axios.get(`${API}/ai/tags/${category}`)
      .then(r => setTags(r.data.tags || []))
      .catch(() => setTags(['Professional', 'Efficient', 'Friendly', 'Helpful', 'Excellent']));
  }, [category]);

  // Reset the generated draft AND the selected tag if the rating crosses the
  // low/high boundary, so a positive draft/tag is never carried over to a low
  // rating (and vice versa) — the tag sets differ between the two modes.
  useEffect(() => {
    setDraft('');
    setSelectedTags([]);
  }, [isLowRating]);

  // Low ratings show critical "areas to improve" tags; high ratings show the
  // category's positive quality tags fetched from the backend.
  const displayTags = isLowRating ? CRITIQUE_TAGS : tags;

  // Single-select: clicking a new tag replaces the previous selection, and
  // clicking the already-selected tag clears it.
  const toggleTag = (tag) => {
    setSelectedTags(prev => (prev.includes(tag) ? [] : [tag]));
  };

  const handleMagicWrite = async () => {
    if (selectedTags.length === 0) {
      toast.error(isLowRating ? 'Select at least one area to improve' : 'Select at least one quality tag');
      return;
    }
    setGenerating(true);
    try {
      const { data } = await axios.post(`${API}/ai/magic-write`, {
        member_name: memberName,
        tags: selectedTags,
        category: category,
        rating: rating,
      });
      setDraft(data.review_draft);
    } catch {
      toast.error('Failed to generate review');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast.error('Please write your feedback first');
      return;
    }
    setFeedbackSending(true);
    try {
      await axios.post(`${API}/portal/private-feedback`, {
        client_id: clientId,
        member_id: memberId,
        member_name: memberName,
        rating,
        message: feedbackMessage.trim(),
      });
      setFeedbackSent(true);
      toast.success('Your feedback has been sent to management');
    } catch {
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setFeedbackSending(false);
    }
  };

  // The "Leave Review" control is a real <a> element (see render below) so the
  // browser performs the navigation natively — no programmatic window.open.
  // This is what eliminates the mobile "needs multiple taps / freeze" bug:
  // window.open() inside a JS handler is treated as a popup on iOS/Android and
  // is throttled or blocked, whereas a genuine anchor tap always navigates on
  // the first tap. This handler only runs the side effects (copy + alert) and
  // does NOT block or await anything, so the native navigation is never delayed.
  const handleLeaveReview = () => {
    // Copy to clipboard — fire and forget, never await (awaiting would break the
    // user-gesture context). writeText() must be called synchronously inside the
    // tap handler for the clipboard permission to be granted on mobile.
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(draft).catch(() => {});
      }
    } catch {}

    // Notify management of a low rating — also fire and forget, no await.
    if (isLowRating && !alertSent) {
      setAlertSent(true);
      axios.post(`${API}/portal/low-rating-alert`, {
        client_id: clientId,
        member_id: memberId,
        member_name: memberName,
        rating,
      }).catch(() => {});
    }
    // No navigation here — the <a href> handles it natively within the gesture.
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

        {/* Private Feedback — prominent for low (1-3 star) ratings */}
        {isLowRating && (
          <div
            className="p-5 bg-white border-2 border-[#002FA7]/20 rounded-sm shadow-sm"
            data-testid="private-feedback-section"
          >
            {feedbackSent ? (
              <div className="text-center py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-base font-medium text-[#09090B]">Thank you for your feedback</p>
                <p className="text-sm text-zinc-500 mt-1">Management has been notified and will look into it.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
                  <h2 className="text-base font-medium text-[#09090B]">Send Private Feedback to Management</h2>
                </div>
                <p className="text-sm text-zinc-500 mb-4">
                  Sorry your experience fell short. Tell management directly so they can make it right —
                  this goes straight to them and stays private.
                </p>
                <Textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="What could we have done better?"
                  rows={4}
                  className="rounded-sm border-zinc-200 text-base resize-none"
                  data-testid="private-feedback-textarea"
                />
                <Button
                  onClick={handleSendFeedback}
                  disabled={feedbackSending || !feedbackMessage.trim()}
                  className="w-full h-12 mt-3 rounded-sm bg-[#002FA7] hover:bg-[#001f7a] text-white text-sm font-medium disabled:opacity-50"
                  data-testid="send-feedback-button"
                >
                  {feedbackSending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" strokeWidth={1.5} /> Send Private Feedback</>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Public review flow — secondary for low ratings, primary for high ratings */}
        <div className={isLowRating ? 'pt-2 border-t border-zinc-200' : ''}>
          {isLowRating && (
            <p className="text-sm text-zinc-400 mb-6 mt-4">
              You can still post a public review if you'd like.
            </p>
          )}

          <div className="space-y-8">
            {/* Tag Selection */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400 mb-3">
                {isLowRating ? 'Which areas need improvement?' : 'How was your experience?'}
              </p>
              <div className="flex flex-col gap-2" role="radiogroup">
                {displayTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => toggleTag(tag)}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-sm rounded-sm border text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#002FA7]/5 text-[#09090B] border-[#002FA7]'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#002FA7]/50'
                      }`}
                      data-testid={`tag-${tag.toLowerCase()}`}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                          isSelected ? 'border-[#002FA7]' : 'border-zinc-300'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#002FA7]" />}
                      </span>
                      {tag}
                    </button>
                  );
                })}
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

                {redirectUrl && (
                  <>
                    {/* Instructional note above the single combined action button */}
                    <div
                      className="flex items-start gap-2 px-3 py-2.5 bg-[#002FA7]/5 rounded-sm"
                      data-testid="copy-paste-hint"
                    >
                      <Info className="w-4 h-4 text-[#002FA7] mt-0.5 shrink-0" strokeWidth={1.5} />
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Your review is automatically copied! Just long-press and tap{' '}
                        <span className="font-semibold">'Paste'</span> when Google Maps opens.
                      </p>
                    </div>

                    {/* Single control: a native <a> tap copies the draft AND opens
                        the review link in one tap with no lag. Rendered as an anchor
                        (not a JS window.open) so iOS/Android navigate on the first
                        tap instead of treating it as a throttled popup. */}
                    <Button
                      asChild
                      className="w-full h-12 rounded-sm bg-[#09090B] hover:bg-zinc-800 text-white text-sm font-medium"
                    >
                      <a
                        href={redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleLeaveReview}
                        data-testid="leave-review-button"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} /> Leave Review
                      </a>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
