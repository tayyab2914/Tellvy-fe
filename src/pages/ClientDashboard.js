import React, { useState, useEffect } from 'react';
import { api, fileUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Users, MousePointerClick } from 'lucide-react';

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/client/profile').then(r => setProfile(r.data)).catch(() => {});
    api.get('/client/leaderboard').then(r => setLeaderboard(r.data)).catch(() => {});
    api.get('/client/reviews').then(r => setReviews(r.data.slice(0, 3))).catch(() => {});
  }, []);

  const totalIntents = leaderboard.reduce((sum, m) => sum + m.intent_count, 0);

  return (
    <div className="p-6 space-y-6" data-testid="client-dashboard">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#09090B]">
          {profile?.business_name || 'Dashboard'}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Performance overview and team leaderboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Team Size</span>
              <Users className="w-4 h-4 text-[#002FA7]" strokeWidth={1.5} />
            </div>
            <p className="font-heading text-3xl font-medium text-[#09090B]">{leaderboard.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Total Selections</span>
              <MousePointerClick className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="font-heading text-3xl font-medium text-[#09090B]">{totalIntents}</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-zinc-200 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">Recent Reviews</span>
              <Star className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            </div>
            <p className="font-heading text-3xl font-medium text-[#09090B]">{reviews.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg font-medium tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">No team members yet. Add staff to see their performance.</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((member, i) => (
                <div key={member.id} className="flex items-center gap-4 p-3 bg-zinc-50 border border-zinc-100 rounded-sm" data-testid={`leaderboard-member-${member.id}`}>
                  <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-zinc-200 text-zinc-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="w-10 h-10 rounded-sm bg-[#002FA7]/10 flex items-center justify-center text-sm font-medium text-[#002FA7] overflow-hidden">
                    {member.photo_path ? (
                      <img src={fileUrl(member.photo_path)} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#09090B]">{member.name}</p>
                    <p className="text-xs text-zinc-400">{member.role_title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-[#09090B]">{member.intent_count}</p>
                    <p className="text-xs text-zinc-400">selections</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card className="rounded-sm border-zinc-200 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg font-medium tracking-tight">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4">No reviews yet</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="p-4 border border-zinc-100 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-sm bg-zinc-100 text-zinc-600 text-xs hover:bg-zinc-100">{r.source}</Badge>
                      <div className="flex">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">{r.text}</p>
                  <p className="text-xs text-zinc-400 mt-1">- {r.author}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
