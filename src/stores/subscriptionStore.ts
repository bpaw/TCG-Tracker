import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import repositoryFactory from '../data/repository/factory';

// RevenueCat types (will be properly typed when real API keys are added)
type PurchasesOffering = any;
type PurchasesPackage = any;

export type SubscriptionType = 'free' | 'premium';

export interface SubscriptionLimits {
  maxEvents: number | null; // null = unlimited
  maxDecks: number | null;
  maxMatches: number | null;
}

const FREE_LIMITS: SubscriptionLimits = {
  maxEvents: 5,
  maxDecks: 5,
  maxMatches: 15,
};

const PREMIUM_LIMITS: SubscriptionLimits = {
  maxEvents: null,
  maxDecks: null,
  maxMatches: null,
};

interface SubscriptionState {
  subscriptionType: SubscriptionType;
  isInitialized: boolean;
  isPurchasing: boolean;
  offerings: PurchasesOffering | null;

  // Initialize RevenueCat and load subscription status
  initialize: () => Promise<void>;

  // Load subscription status from Supabase
  loadSubscriptionStatus: () => Promise<void>;

  // Update subscription status in Supabase
  updateSubscriptionStatus: (type: SubscriptionType) => Promise<void>;

  // Purchase a subscription (stubbed for now)
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<boolean>;

  // Cancel subscription
  cancelSubscription: () => Promise<boolean>;

  // Restore purchases
  restorePurchases: () => Promise<boolean>;

  // Get subscription limits based on current tier
  getLimits: () => SubscriptionLimits;

  // Check if user can create more items
  canCreateEvent: (currentCount: number) => boolean;
  canCreateDeck: (currentCount: number) => boolean;
  canCreateMatch: (currentCount: number) => boolean;

  // Set subscription type (for testing/stubbing)
  setSubscriptionType: (type: SubscriptionType) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscriptionType: 'free',
  isInitialized: false,
  isPurchasing: false,
  offerings: null,

  initialize: async () => {
    try {
      console.log('[SubscriptionStore] Initializing RevenueCat...');

      // TODO: Replace with real API keys when Apple Developer account is ready
      const REVENUECAT_API_KEY = __DEV__
        ? 'fake_dev_key_12345'
        : 'fake_prod_key_67890';

      // In development/stub mode, we'll skip actual RevenueCat setup
      if (__DEV__) {
        console.log('[SubscriptionStore] Running in stub mode - skipping RevenueCat initialization');
        set({ isInitialized: true });
        await get().loadSubscriptionStatus();
        return;
      }

      // TODO: Uncomment when you have real API keys
      // await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      // const customerInfo = await Purchases.getCustomerInfo();
      // await get().syncSubscriptionStatus(customerInfo);

      set({ isInitialized: true });
      await get().loadSubscriptionStatus();

      console.log('[SubscriptionStore] Initialized successfully');
    } catch (error) {
      console.error('[SubscriptionStore] Failed to initialize:', error);
      set({ isInitialized: true }); // Still mark as initialized to not block app
    }
  },

  loadSubscriptionStatus: async () => {
    try {
      const user = useAuthStore.getState().user;
      console.log('[SubscriptionStore] Loading subscription status...');
      console.log('[SubscriptionStore] User:', user ? { id: user.id, email: user.email } : 'null');

      if (!user) {
        console.log('[SubscriptionStore] No user, defaulting to free');
        set({ subscriptionType: 'free' });
        return;
      }

      console.log(`[SubscriptionStore] Querying user_profiles for user ${user.id}`);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_type')
        .eq('id', user.id)
        .single();

      console.log('[SubscriptionStore] Query result:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          // Row doesn't exist, create it with free tier
          console.log('[SubscriptionStore] No profile found (PGRST116), creating with free tier');
          await get().updateSubscriptionStatus('free');
        } else {
          console.error('[SubscriptionStore] Failed to load subscription:', error);
          console.error('[SubscriptionStore] Error details:', JSON.stringify(error));
          set({ subscriptionType: 'free' });
        }
        return;
      }

      const type = (data?.subscription_type || 'free') as SubscriptionType;
      console.log(`[SubscriptionStore] Loaded subscription type: ${type}`);
      set({ subscriptionType: type });
    } catch (error) {
      console.error('[SubscriptionStore] Error loading subscription:', error);
      set({ subscriptionType: 'free' });
    }
  },

  updateSubscriptionStatus: async (type: SubscriptionType) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        console.warn('[SubscriptionStore] Cannot update subscription - no user');
        return;
      }

      console.log(`[SubscriptionStore] Updating subscription to: ${type}`);

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          subscription_type: type,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('[SubscriptionStore] Failed to update subscription:', error);
        throw error;
      }

      set({ subscriptionType: type });

      // Reset repository cache so new storage type is used
      repositoryFactory.reset();
      console.log('[SubscriptionStore] Repository cache cleared - storage will switch on next access');

      console.log('[SubscriptionStore] Subscription updated successfully');
    } catch (error) {
      console.error('[SubscriptionStore] Error updating subscription:', error);
      throw error;
    }
  },

  purchasePackage: async (packageToPurchase: PurchasesPackage) => {
    try {
      set({ isPurchasing: true });

      console.log('[SubscriptionStore] STUB: Simulating purchase...');

      // TODO: Replace with real purchase flow when Apple Developer account is ready
      // const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      // await get().syncSubscriptionStatus(customerInfo);

      // Stub: Automatically grant premium for testing
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      await get().updateSubscriptionStatus('premium');

      console.log('[SubscriptionStore] STUB: Purchase successful (simulated)');
      set({ isPurchasing: false });
      return true;
    } catch (error) {
      console.error('[SubscriptionStore] Purchase failed:', error);
      set({ isPurchasing: false });
      return false;
    }
  },

  cancelSubscription: async () => {
    try {
      console.log('[SubscriptionStore] Cancelling subscription...');

      // TODO: Replace with real cancellation flow when Apple Developer account is ready
      // This would typically involve calling RevenueCat to cancel the subscription

      // Update user profile to free tier
      await get().updateSubscriptionStatus('free');

      console.log('[SubscriptionStore] Subscription cancelled successfully');
      return true;
    } catch (error) {
      console.error('[SubscriptionStore] Failed to cancel subscription:', error);
      return false;
    }
  },

  restorePurchases: async () => {
    try {
      console.log('[SubscriptionStore] STUB: Restoring purchases...');

      // TODO: Replace with real restore flow
      // const customerInfo = await Purchases.restorePurchases();
      // await get().syncSubscriptionStatus(customerInfo);

      // Stub: Just reload from Supabase
      await get().loadSubscriptionStatus();

      return true;
    } catch (error) {
      console.error('[SubscriptionStore] Failed to restore purchases:', error);
      return false;
    }
  },

  getLimits: () => {
    const { subscriptionType } = get();
    return subscriptionType === 'premium' ? PREMIUM_LIMITS : FREE_LIMITS;
  },

  canCreateEvent: (currentCount: number) => {
    const limits = get().getLimits();
    return limits.maxEvents === null || currentCount < limits.maxEvents;
  },

  canCreateDeck: (currentCount: number) => {
    const limits = get().getLimits();
    return limits.maxDecks === null || currentCount < limits.maxDecks;
  },

  canCreateMatch: (currentCount: number) => {
    const limits = get().getLimits();
    return limits.maxMatches === null || currentCount < limits.maxMatches;
  },

  setSubscriptionType: (type: SubscriptionType) => {
    console.log(`[SubscriptionStore] Manually setting subscription type: ${type}`);
    set({ subscriptionType: type });
    // Also update in Supabase
    get().updateSubscriptionStatus(type);
  },
}));
