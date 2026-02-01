import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'wouter';

/**
 * Usage Display Component
 * 
 * Shows current usage stats and limits
 * Displays upgrade prompts when limits are reached
 */
export default function UsageDisplay() {
  const { data: usage, isLoading } = trpc.usage.getUsage.useQuery();

  if (isLoading || !usage) {
    return null;
  }

  const { analyses, exports, chats } = usage;
  const isNearLimit = (percentage: number) => percentage >= 80;
  const isAtLimit = (percentage: number) => percentage >= 100;

  const hasAnyLimits = 
    analyses.limit !== Infinity || 
    exports.limit !== Infinity || 
    chats.limit !== Infinity;

  if (!hasAnyLimits) {
    return null; // Don't show for unlimited plans
  }

  const showUpgradeAlert = 
    isAtLimit(analyses.percentage) || 
    isAtLimit(exports.percentage) || 
    isAtLimit(chats.percentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Usage This Month
        </CardTitle>
        <CardDescription>
          Track your feature usage and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showUpgradeAlert && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You've reached your monthly limit</span>
              <Button asChild size="sm" variant="outline">
                <Link href="/pricing">Upgrade Now</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Property Analyses */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Property Analyses</span>
            <span className={isAtLimit(analyses.percentage) ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {analyses.current} / {analyses.limit === Infinity ? '∞' : analyses.limit}
            </span>
          </div>
          {analyses.limit !== Infinity && (
            <>
              <Progress 
                value={Math.min(analyses.percentage, 100)} 
                className={isAtLimit(analyses.percentage) ? 'bg-destructive/20' : isNearLimit(analyses.percentage) ? 'bg-yellow-200' : ''}
              />
              {isNearLimit(analyses.percentage) && !isAtLimit(analyses.percentage) && (
                <p className="text-xs text-yellow-600">
                  You're approaching your monthly limit
                </p>
              )}
            </>
          )}
        </div>

        {/* Exports */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Exports</span>
            <span className={isAtLimit(exports.percentage) ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {exports.current} / {exports.limit === Infinity ? '∞' : exports.limit}
            </span>
          </div>
          {exports.limit !== Infinity && (
            <>
              <Progress 
                value={Math.min(exports.percentage, 100)} 
                className={isAtLimit(exports.percentage) ? 'bg-destructive/20' : isNearLimit(exports.percentage) ? 'bg-yellow-200' : ''}
              />
              {exports.limit === 0 && (
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro to unlock exports
                </p>
              )}
            </>
          )}
        </div>

        {/* AI Chat Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">AI Chat Messages</span>
            <span className={isAtLimit(chats.percentage) ? 'text-destructive font-medium' : 'text-muted-foreground'}>
              {chats.current} / {chats.limit === Infinity ? '∞' : chats.limit}
            </span>
          </div>
          {chats.limit !== Infinity && (
            <>
              <Progress 
                value={Math.min(chats.percentage, 100)} 
                className={isAtLimit(chats.percentage) ? 'bg-destructive/20' : isNearLimit(chats.percentage) ? 'bg-yellow-200' : ''}
              />
              {isNearLimit(chats.percentage) && !isAtLimit(chats.percentage) && (
                <p className="text-xs text-yellow-600">
                  You're approaching your monthly limit
                </p>
              )}
            </>
          )}
        </div>

        {!showUpgradeAlert && hasAnyLimits && (
          <div className="pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link href="/pricing">
                Upgrade for Unlimited Access
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
