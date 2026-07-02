import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import {
  analyzeDeploymentPackage,
  createDeploymentPackage,
  createMonitoringSnapshot,
  executeDeploymentPackage,
  listDeploymentPackagesForLead,
  listMonitoringSnapshots,
  runMonitoringAnalysis,
  simulateMonitoringSnapshot,
} from '@/api/deployment'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import { creativeKeys } from '@/hooks/useCreatives'
import type {
  DeploymentAnalyzeRequest,
  DeploymentExecuteRequest,
  DeploymentPackageCreateRequest,
  MonitoringSnapshotCreateRequest,
} from '@/types/deployment'

export const deploymentKeys = {
  all: ['deployment'] as const,
  packages: (leadId: string) => [...deploymentKeys.all, 'packages', leadId] as const,
  snapshots: (packageId: string) =>
    [...deploymentKeys.all, 'monitoring-snapshots', packageId] as const,
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (detail && typeof detail === 'object' && 'message' in detail) {
      return String((detail as { message: string }).message)
    }
  }
  if (error instanceof Error) return error.message
  return fallback
}

export function useDeploymentPackagesQuery(leadId: string | null) {
  return useQuery({
    queryKey: deploymentKeys.packages(leadId ?? ''),
    queryFn: () => listDeploymentPackagesForLead(leadId!, { limit: 50 }),
    enabled: Boolean(leadId),
  })
}

function invalidateDeploymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  leadId: string,
) {
  queryClient.invalidateQueries({ queryKey: deploymentKeys.packages(leadId) })
  queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
}

export function useCreateDeploymentPackageMutation(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      creativeSetId,
      payload = {},
    }: {
      creativeSetId: string
      payload?: DeploymentPackageCreateRequest
    }) => createDeploymentPackage(creativeSetId, payload),
    onSuccess: () => {
      invalidateDeploymentQueries(queryClient, leadId)
      toast.success('Deployment package created')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to create deployment package.'))
    },
  })
}

export function useAnalyzeDeploymentMutation(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      packageId,
      payload = {},
    }: {
      packageId: string
      payload?: DeploymentAnalyzeRequest
    }) => analyzeDeploymentPackage(packageId, payload),
    onSuccess: () => {
      invalidateDeploymentQueries(queryClient, leadId)
      toast.success('Deployment analysis complete')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to analyze deployment.'))
    },
  })
}

export function useExecuteDeploymentMutation(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      packageId,
      payload = {},
    }: {
      packageId: string
      payload?: DeploymentExecuteRequest
    }) => executeDeploymentPackage(packageId, payload),
    onSuccess: () => {
      invalidateDeploymentQueries(queryClient, leadId)
      queryClient.invalidateQueries({ queryKey: creativeKeys.sets(leadId) })
      toast.success('Deployment executed')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to execute deployment.'))
    },
  })
}

export function useMonitoringSnapshotsQuery(packageId: string | null, enabled = true) {
  return useQuery({
    queryKey: deploymentKeys.snapshots(packageId ?? ''),
    queryFn: () => listMonitoringSnapshots(packageId!, { limit: 50 }),
    enabled: Boolean(packageId) && enabled,
  })
}

function invalidateMonitoringQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  leadId: string,
  packageId: string,
) {
  invalidateDeploymentQueries(queryClient, leadId)
  queryClient.invalidateQueries({ queryKey: deploymentKeys.snapshots(packageId) })
}

export function useCreateMonitoringSnapshotMutation(leadId: string, packageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: MonitoringSnapshotCreateRequest) =>
      createMonitoringSnapshot(packageId, payload),
    onSuccess: () => {
      invalidateMonitoringQueries(queryClient, leadId, packageId)
      toast.success('Monitoring snapshot recorded')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to record monitoring snapshot.'))
    },
  })
}

export function useSimulateMonitoringSnapshotMutation(leadId: string, packageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => simulateMonitoringSnapshot(packageId),
    onSuccess: () => {
      invalidateMonitoringQueries(queryClient, leadId, packageId)
      toast.success('Test snapshot added')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to add test snapshot.'))
    },
  })
}

export function useRunMonitoringAnalysisMutation(leadId: string, packageId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => runMonitoringAnalysis(packageId),
    onSuccess: () => {
      invalidateMonitoringQueries(queryClient, leadId, packageId)
      toast.success('Monitoring analysis complete')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to run monitoring analysis.'))
    },
  })
}
