import { useState } from 'react';
import axios from 'axios';
import { route } from 'ziggy-js';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Heart, Trophy } from 'lucide-react';
import { PageHeader, Navbar, Footer } from '@/components/layout';
import { useTranslation } from '@/lib/i18n';

interface Competition {
  id: number;
  title?: string;
  category?: string;
  image?: string;
}

interface Submission {
  id: number;
  title: string;
  description?: string | null;
  votes?: number;
  status: string;
  competitionId?: number;
  competition_id?: number;
  competition?: Competition;
  hasVoted?: boolean;
  userVote?: 'like' | 'dislike' | null;
}

interface VoteState {
  liked: boolean;
  votes: number;
}

interface PageProps {
  [key: string]: unknown;
  submissions: Submission[];
}

function GalleryPage() {
  const { submissions = [], auth } = usePage<PageProps>().props;
  const { t } = useTranslation();

  const isAuthenticated = Boolean(
    (auth as { user: unknown })?.user
  );

  const [activeTab, setActiveTab] = useState('all');

  const filteredSubmissions = submissions.filter((submission) => {
    if (activeTab === 'all') return true;
    return submission.competition?.category === activeTab;
  });

  const [votingId, setVotingId] = useState<number | null>(null);

  // Local, optimistic per-submission vote state. Falls back to the
  // server-provided props until the user interacts with a card.
  const [voteState, setVoteState] = useState<Record<number, VoteState>>({});

  const getVoteState = (submission: Submission): VoteState => {
    if (submission.id in voteState) {
      return voteState[submission.id];
    }
    return {
      liked: submission.hasVoted ?? false,
      votes: submission.votes ?? 0,
    };
  };

  const handleVote = (submission: Submission) => {
    if (votingId !== null) return;

    const current = getVoteState(submission);
    const wasLiked = current.liked;
    const action = wasLiked ? 'unlike' : 'like';

    setVotingId(submission.id);

    // Optimistic update: flip the heart and adjust the count immediately,
    // no Inertia visit / prop reload involved.
    setVoteState((prev) => ({
      ...prev,
      [submission.id]: {
        liked: !wasLiked,
        votes: Math.max(0, current.votes + (wasLiked ? -1 : 1)),
      },
    }));

    axios
      .post(route('gallery.vote'), {
        submission_id: submission.id,
        action,
      })
      .then(({ data }) => {
        // Reconcile with the authoritative server counts, in case of
        // a race with another vote or a stale local count.
        if (data && typeof data.votes === 'number') {
          setVoteState((prev) => ({
            ...prev,
            [submission.id]: {
              liked: data.liked,
              votes: data.votes,
            },
          }));
        }
      })
      .catch(() => {
        // Revert on failure
        setVoteState((prev) => ({
          ...prev,
          [submission.id]: current,
        }));
      })
      .finally(() => {
        setVotingId(null);
      });
  };

  return (
    <>
      <Head title={`${t('gallery.title')} – CompeteHub`} />
      <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title={t('gallery.title')}
            description={t('gallery.description')}
          />

          <div className="container mx-auto px-4 py-8">
            {/* Category Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                <TabsTrigger value="Photography">{t('gallery.photography')}</TabsTrigger>
                <TabsTrigger value="Programming">{t('gallery.programming')}</TabsTrigger>
                <TabsTrigger value="Digital Art">{t('gallery.digitalArt')}</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Empty State */}
            {filteredSubmissions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t('gallery.noSubmissions')}</h2>
                <p className="text-muted-foreground">
                  {t('gallery.noSubmissionsDesc')}
                </p>
              </div>
            )}

            {/* Gallery */}
            {filteredSubmissions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubmissions.map((submission) => {
                  const category = submission.competition?.category ?? 'Unknown';
                  const { liked: currentVote, votes: currentVotes } = getVoteState(submission);
                  const isVoting = votingId === submission.id;

                  return (
                    <Card key={submission.id} className="overflow-hidden group">
                      {/* Submission Preview with image fallback */}
                      <div className="h-40 overflow-hidden">
                        {submission.competition?.image ? (
                          <img
                            src={`/competition_management/public/storage/${submission.competition.image}`}
                            alt={submission.competition?.title ?? 'Competition Image'}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <Trophy className="h-16 w-16 text-primary" />
                          </div>
                        )}
                      </div>

                      <CardContent className="pt-4">
                        {/* Title */}
                        <h3 className="font-semibold mb-1">{submission.title}</h3>

                        {/* Description */}
                        {submission.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {submission.description}
                          </p>
                        )}

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between gap-3">
                          {/* Category */}
                          <Badge variant="secondary" className="text-xs">
                            {category}
                          </Badge>

                          {/* Voting Buttons */}
                          <div className="flex items-center gap-1">
                            {/* Like */}
                            {isAuthenticated && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isVoting}
                                onClick={() => handleVote(submission)}
                                className={`cursor-pointer ${currentVote
                                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                                    : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                  }`}
                              >
                                <Heart className={`h-4 w-4 mr-1 ${currentVote ? 'fill-current' : ''}`} />
                                {currentVotes}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}

export default GalleryPage;