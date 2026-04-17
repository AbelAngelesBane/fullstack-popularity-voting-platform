import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'moti/skeleton';

const VoteCardSkeleton = () => {
const skeletonProps = {
    colorMode: 'dark' as const,
    backgroundColor: '#1E293B',
    transition: {
      type: 'timing' as const, 
      duration: 1500,
    },
  };

  return (
    <View className="bg-background-light mt-2 rounded-xl p-2 flex-row items-center gap-2 h-40">
      <Skeleton 
        width={8} 
        height={8} 
        radius="round" 
        {...skeletonProps} 
      />

      <View className="flex-1 gap-2">
        <Skeleton width="70%" height={20} {...skeletonProps} />
        <Skeleton width="40%" height={14} {...skeletonProps} />
      </View>
    </View>
  );
};

// A wrapper to show multiple skeletons while loading
export const VotesListSkeleton = () => {
  return (
    <View>
      {[...Array(6)].map((_, i) => (
        <VoteCardSkeleton key={i} />
      ))}
    </View>
  );
};

export default VoteCardSkeleton;