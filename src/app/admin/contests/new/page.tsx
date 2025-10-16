'use client';

import { useState, useEffect, useMemo } from 'react';
import { doc, collection, updateDoc, increment, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/lib/firebase/provider';
import { useFirestore } from '@/lib/firebase/provider';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  chants: number;
}

export default function ContestsPage() {
  const { user } = useAuth();
  const db = useFirestore();

  const [activeContest, setActiveContest] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Simulate fetching contest from Firestore
  useEffect(() => {
    setActiveContest({
      id: 'jai-shri-ram-2025',
      title: 'Jai Shri Ram Chant Marathon 🪔',
      startDate: '2025-10-16T00:00:00Z',
      endDate: '2025-11-15T23:59:59Z',
    });
  }, []);

  // Normalize Firestore dates
  const startDate = useMemo(() => {
    if (!activeContest) return null;
    return activeContest.startDate instanceof Date
      ? activeContest.startDate
      : activeContest.startDate?.toDate?.() ?? new Date(activeContest.startDate);
  }, [activeContest]);

  const endDate = useMemo(() => {
    if (!activeContest) return null;
    return activeContest.endDate instanceof Date
      ? activeContest.endDate
      : activeContest.endDate?.toDate?.() ?? new Date(activeContest.endDate);
  }, [activeContest]);

  // Check if contest is active
  const isContestActive = startDate && endDate && new Date() >= startDate && new Date() <= endDate;

  // User progress Firestore reference
  const userProgressRef = useMemo(() => {
    if (!user || !activeContest) return null;
    return doc(db, `users/${user.uid}/contestProgress`, activeContest.id);
  }, [db, user, activeContest]);

  const contestRef = useMemo(() => {
    if (!activeContest) return null;
    return doc(db, 'contests', activeContest.id);
  }, [db, activeContest]);

  const [userProgress] = useDocumentData(userProgressRef ? userProgressRef : null);
  const [contestData] = useDocumentData(contestRef ? contestRef : null);

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    if (!activeContest) return;

    const q = query(
      collection(db, 'users'),
      orderBy(`contestProgress.${activeContest.id}.chants`, 'desc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const chants = data.contestProgress?.[activeContest.id]?.chants ?? 0;
      const displayName = data.displayName ?? 'Anonymous';
      entries.push({ uid: docSnap.id, displayName, chants });
    });

    setLeaderboard(entries);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeContest, userProgress]);

  // Handle user chanting
  const handleChant = async () => {
    if (!user || !activeContest || !isContestActive) return;

    // Update user progress
    if (userProgressRef) {
      try {
        await updateDoc(userProgressRef, {
          chants: increment(1),
          lastChantedAt: new Date(),
          displayName: user.displayName || 'Anonymous',
        });
      } catch {
        // If doc doesn't exist, create it
        await updateDoc(userProgressRef, {
          chants: 1,
          lastChantedAt: new Date(),
          displayName: user.displayName || 'Anonymous',
        }).catch(() => {});
      }
    }

    // Update global counter
    if (contestRef) {
      await updateDoc(contestRef, {
        totalChants: increment(1),
      });
    }
  };

  if (!user || !activeContest) return <div className="p-6 text-center">Loading contest...</div>;

  if (!isContestActive)
    return (
      <div className="p-6 text-center text-red-600">
        This contest is not active. <br />
        Contest period: {startDate && format(startDate, 'PPP')} - {endDate && format(endDate, 'PPP')}
      </div>
    );

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-600 mb-2">{activeContest.title}</h1>
      <p className="text-gray-600 mb-6">
        Chant “Jai Shri Ram” and help us reach 1 crore chants!
      </p>

      <div className="bg-orange-50 p-6 rounded-xl shadow-md inline-block mb-6">
        <h2 className="text-xl font-semibold text-orange-700 mb-2">Your Progress</h2>
        <p className="text-2xl font-bold text-orange-800">{userProgress?.chants ?? 0} chants</p>
      </div>

      <div className="bg-orange-100 p-6 rounded-xl shadow-md inline-block mb-6">
        <h2 className="text-xl font-semibold text-orange-700 mb-2">Global Counter</h2>
        <p className="text-2xl font-bold text-orange-800">{contestData?.totalChants ?? 0} chants</p>
      </div>

      <Button
        onClick={handleChant}
        className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-4 rounded-full mb-6"
      >
        Chant Jai Shri Ram 🙏
      </Button>

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-2 text-orange-600">Top Devotees</h2>
        <ol className="text-left mx-auto max-w-md space-y-1">
          {leaderboard.map((entry, idx) => (
            <li key={entry.uid} className="flex justify-between">
              <span>{idx + 1}. {entry.displayName}</span>
              <span>{entry.chants} 🪔</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
