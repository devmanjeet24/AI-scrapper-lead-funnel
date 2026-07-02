import type {
  DeploymentAnalyzeRequest,
  DeploymentExecuteRequest,
  DeploymentPackage,
  DeploymentPackageCreateRequest,
  MonitoringAnalysisResponse,
  MonitoringSnapshot,
  MonitoringSnapshotCreateRequest,
  PaginatedDeploymentPackagesResponse,
  PaginatedMonitoringSnapshotsResponse,
} from '@/types/deployment'

import { apiClient } from './client'

export async function listDeploymentPackages(
  params: { lead_id?: string; status?: string; limit?: number; offset?: number } = {},
): Promise<PaginatedDeploymentPackagesResponse> {
  const { data } = await apiClient.get<PaginatedDeploymentPackagesResponse>(
    '/deployment-packages',
    { params },
  )
  return data
}

export async function createDeploymentPackage(
  creativeSetId: string,
  payload: DeploymentPackageCreateRequest = {},
): Promise<DeploymentPackage> {
  const { data } = await apiClient.post<DeploymentPackage>(
    `/creative-sets/${creativeSetId}/deployment-package`,
    payload,
  )
  return data
}

export async function listDeploymentPackagesForLead(
  leadId: string,
  params: { status?: string; limit?: number; offset?: number } = {},
): Promise<PaginatedDeploymentPackagesResponse> {
  const { data } = await apiClient.get<PaginatedDeploymentPackagesResponse>(
    `/leads/${leadId}/deployment-packages`,
    { params },
  )
  return data
}

export async function getDeploymentPackage(packageId: string): Promise<DeploymentPackage> {
  const { data } = await apiClient.get<DeploymentPackage>(`/deployment-packages/${packageId}`)
  return data
}

export async function analyzeDeploymentPackage(
  packageId: string,
  payload: DeploymentAnalyzeRequest = {},
): Promise<DeploymentPackage> {
  const { data } = await apiClient.post<DeploymentPackage>(
    `/deployment-packages/${packageId}/analyze`,
    payload,
  )
  return data
}

export async function executeDeploymentPackage(
  packageId: string,
  payload: DeploymentExecuteRequest = {},
): Promise<DeploymentPackage> {
  const { data } = await apiClient.post<DeploymentPackage>(
    `/deployment-packages/${packageId}/execute`,
    payload,
  )
  return data
}

export async function listMonitoringSnapshots(
  packageId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedMonitoringSnapshotsResponse> {
  const { data } = await apiClient.get<PaginatedMonitoringSnapshotsResponse>(
    `/deployment-packages/${packageId}/monitoring-snapshots`,
    { params },
  )
  return data
}

export async function createMonitoringSnapshot(
  packageId: string,
  payload: MonitoringSnapshotCreateRequest,
): Promise<MonitoringSnapshot> {
  const { data } = await apiClient.post<MonitoringSnapshot>(
    `/deployment-packages/${packageId}/monitoring-snapshots`,
    payload,
  )
  return data
}

export async function simulateMonitoringSnapshot(packageId: string): Promise<MonitoringSnapshot> {
  const { data } = await apiClient.post<MonitoringSnapshot>(
    `/deployment-packages/${packageId}/monitoring-snapshots/simulate`,
  )
  return data
}

export async function runMonitoringAnalysis(
  packageId: string,
): Promise<MonitoringAnalysisResponse> {
  const { data } = await apiClient.post<MonitoringAnalysisResponse>(
    `/deployment-packages/${packageId}/monitor`,
  )
  return data
}
