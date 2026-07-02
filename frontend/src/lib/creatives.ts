import type { CreativeAsset, CreativeAssetType } from '@/types/creative'

export const CREATIVE_ASSET_TYPE_LABELS: Record<CreativeAssetType, string> = {
  headline: 'Headline',
  ad_copy: 'Ad Copy',
  campaign_idea: 'Campaign Idea',
  targeting_suggestion: 'Targeting',
}

export function getCreativeAssetDisplayText(asset: CreativeAsset): string {
  if (asset.body_text?.trim()) {
    return asset.body_text.trim()
  }
  if (asset.title?.trim()) {
    return asset.title.trim()
  }
  const text = asset.content.text ?? asset.content.copy ?? asset.content.headline
  if (typeof text === 'string' && text.trim()) {
    return text.trim()
  }
  return JSON.stringify(asset.content, null, 2)
}

export function countApprovedAssets(assets: CreativeAsset[]): {
  headlines: number
  adCopy: number
} {
  const approved = assets.filter((asset) => asset.status === 'approved')
  return {
    headlines: approved.filter((asset) => asset.asset_type === 'headline').length,
    adCopy: approved.filter((asset) => asset.asset_type === 'ad_copy').length,
  }
}

export function canCreateDeployment(assets: CreativeAsset[]): boolean {
  const { headlines, adCopy } = countApprovedAssets(assets)
  return headlines >= 1 && adCopy >= 1
}
