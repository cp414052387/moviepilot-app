/**
 * Site Hook
 *
 * Manages download site data and state
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getSites,
  getSiteDetails,
  createSite,
  updateSite,
  deleteSite,
  testSite,
  enableSite,
  disableSite,
  getSiteStats,
  getSiteRules,
  createSiteRule,
  updateSiteRule,
  deleteSiteRule,
} from '@/api/site';
import type { Site, SiteStats, SiteTestResult, SiteRule } from '@/types/site';

export function useSite() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [siteError, setSiteError] = useState<string | null>(null);

  const [stats, setStats] = useState<SiteStats | null>(null);

  const [testingSiteId, setTestingSiteId] = useState<string | null>(null);

  /**
   * Fetch all sites
   */
  const fetchSites = useCallback(async () => {
    try {
      setIsLoadingSites(true);
      setSiteError(null);
      const data = await getSites();
      setSites(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sites';
      setSiteError(errorMessage);
      console.error('Fetch sites error:', err);
      return [];
    } finally {
      setIsLoadingSites(false);
    }
  }, []);

  /**
   * Fetch site details
   */
  const fetchSiteDetails = useCallback(async (siteId: string) => {
    try {
      const data = await getSiteDetails(siteId);
      setSelectedSite(data);
      return data;
    } catch (err) {
      console.error('Fetch site details error:', err);
      return null;
    }
  }, []);

  /**
   * Create site
   */
  const create = useCallback(async (site: Omit<Site, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const data = await createSite(site);
      await fetchSites(); // Refresh site list
      return data;
    } catch (err) {
      console.error('Create site error:', err);
      return null;
    }
  }, [fetchSites]);

  /**
   * Update site
   */
  const update = useCallback(async (siteId: string, site: Partial<Site>) => {
    try {
      const data = await updateSite(siteId, site);
      await fetchSites(); // Refresh site list
      return data;
    } catch (err) {
      console.error('Update site error:', err);
      return null;
    }
  }, [fetchSites]);

  /**
   * Delete site
   */
  const remove = useCallback(async (siteId: string) => {
    try {
      await deleteSite(siteId);
      await fetchSites(); // Refresh site list
      return true;
    } catch (err) {
      console.error('Delete site error:', err);
      return false;
    }
  }, [fetchSites]);

  /**
   * Test site connection
   */
  const test = useCallback(async (siteId: string): Promise<SiteTestResult> => {
    try {
      setTestingSiteId(siteId);
      const result = await testSite(siteId);
      return result;
    } catch (err) {
      console.error('Test site error:', err);
      return { success: false, message: 'Test failed', error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setTestingSiteId(null);
    }
  }, []);

  /**
   * Enable site
   */
  const enable = useCallback(async (siteId: string) => {
    try {
      await enableSite(siteId);
      await fetchSites(); // Refresh site list
      return true;
    } catch (err) {
      console.error('Enable site error:', err);
      return false;
    }
  }, [fetchSites]);

  /**
   * Disable site
   */
  const disable = useCallback(async (siteId: string) => {
    try {
      await disableSite(siteId);
      await fetchSites(); // Refresh site list
      return true;
    } catch (err) {
      console.error('Disable site error:', err);
      return false;
    }
  }, [fetchSites]);

  /**
   * Fetch site stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await getSiteStats();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Fetch site stats error:', err);
      return null;
    }
  }, []);

  /**
   * Fetch site rules
   */
  const fetchRules = useCallback(async (siteId: string) => {
    try {
      const data = await getSiteRules(siteId);
      return data;
    } catch (err) {
      console.error('Fetch site rules error:', err);
      return [];
    }
  }, []);

  /**
   * Create site rule
   */
  const createRule = useCallback(async (siteId: string, rule: Omit<SiteRule, 'id' | 'site_id'>) => {
    try {
      const data = await createSiteRule(siteId, rule);
      return data;
    } catch (err) {
      console.error('Create site rule error:', err);
      return null;
    }
  }, []);

  /**
   * Update site rule
   */
  const updateRule = useCallback(async (siteId: string, ruleId: string, rule: Partial<SiteRule>) => {
    try {
      const data = await updateSiteRule(siteId, ruleId, rule);
      return data;
    } catch (err) {
      console.error('Update site rule error:', err);
      return null;
    }
  }, []);

  /**
   * Delete site rule
   */
  const deleteRule = useCallback(async (siteId: string, ruleId: string) => {
    try {
      await deleteSiteRule(siteId, ruleId);
      return true;
    } catch (err) {
      console.error('Delete site rule error:', err);
      return false;
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchSites(),
      fetchStats(),
    ]);
  }, [fetchSites, fetchStats]);

  // Initial data fetch
  useEffect(() => {
    refreshAll();
  }, []);

  return {
    // Sites
    sites,
    selectedSite,
    isLoadingSites,
    siteError,
    fetchSites,
    fetchSiteDetails,
    create,
    update,
    remove,
    selectSite: setSelectedSite,

    // Actions
    testingSiteId,
    test,
    enable,
    disable,

    // Stats
    stats,
    fetchStats,

    // Rules
    fetchRules,
    createRule,
    updateRule,
    deleteRule,

    // General
    refreshAll,
  };
}
