'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, LogIn, ThumbsUp } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'

import { ComparisonCard } from '@/components/dashboard/projects/comparison-card'
import { useNextPair } from '@/hooks/use-next-pair'
import { useVote } from '@/hooks/use-vote'
import { ErrorToast, SuccessToast } from '@/lib/toast'
import type { Item } from '@/lib/api'
import { ApiError } from '@/lib/api'

export const CompareContent = ({
  projectId,
  projectName,
}: {
  projectId: string
  projectName: string
}) => {
  const router = useRouter()
  const [animationKey, setAnimationKey] = useState(0)
  const voteMutation = useVote(projectId)
  const { data: pair, isLoading, isError, error, refetch } = useNextPair(projectId)
  const previousPair = useRef<{ itemA: Item; itemB: Item } | null>(null)

  const currentPair = voteMutation.isPending ? previousPair.current : (pair ?? null)

  useEffect(() => {
    if (pair) {
      previousPair.current = pair
      setAnimationKey((k) => k + 1)
    }
  }, [pair])

  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleVote = async (winnerId: string) => {
    if (!currentPair) return

    try {
      await voteMutation.mutateAsync({
        itemAId: currentPair.itemA.id,
        itemBId: currentPair.itemB.id,
        winnerId,
      })
      SuccessToast('Vote registered!')
      refetch()
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : 'Failed to register vote')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError && error instanceof ApiError && error.status === 401) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
        <LogIn className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sign in to vote</h2>
        <p className="text-muted-foreground">
          You need to be signed in to compare items in this project.
        </p>
        <Button asChild>
          <a href="/login">Sign in</a>
        </Button>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load next pair.</p>
        <Button variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    )
  }

  if (!currentPair) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
        <ThumbsUp className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">All done!</h2>
        <p className="text-muted-foreground">
          You've compared all items in this project.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
      </div>
    )
  }

  return (
    <div key={animationKey} className="flex min-h-dvh flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-xl font-semibold">Which one do you prefer?</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{projectName}</p>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="size-3" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <ComparisonCard
          item={currentPair.itemA}
          onSelect={() => handleVote(currentPair.itemA.id)}
          disabled={voteMutation.isPending}
        />
        <ComparisonCard
          item={currentPair.itemB}
          onSelect={() => handleVote(currentPair.itemB.id)}
          disabled={voteMutation.isPending}
        />
      </div>
    </div>
  )
}
