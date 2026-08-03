import {
  bigint,
  boolean,
  index,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import type { AnyReport } from '../schemas'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkUserId: text('clerk_user_id').notNull(),
    displayName: text('display_name'),
    email: text('email'),
    onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    clerkIdx: uniqueIndex('users_clerk_user_id_key').on(table.clerkUserId),
  })
)

export const brandProfiles = pgTable(
  'brand_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    targetAudience: text('target_audience').notNull().default(''),
    personality: text('personality').notNull().default(''),
    desiredImpression: text('desired_impression').notNull().default(''),
    primaryPlatform: text('primary_platform').notNull().default(''),
    primaryColours: jsonb('primary_colours').$type<string[]>().notNull().default([]),
    secondaryColours: jsonb('secondary_colours').$type<string[]>().notNull().default([]),
    positiveWords: jsonb('positive_words').$type<string[]>().notNull().default([]),
    negativeWords: jsonb('negative_words').$type<string[]>().notNull().default([]),
    logoStoragePath: text('logo_storage_path'),
    referenceStoragePath: text('reference_storage_path'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('brand_profiles_user_id_idx').on(table.userId),
  })
)

export const analyses = pgTable(
  'analyses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull(),
    title: text('title').notNull(),
    visualType: text('visual_type').notNull().default(''),
    platform: text('platform').notNull().default(''),
    targetAudience: text('target_audience').notNull().default(''),
    goal: text('goal').notNull().default(''),
    desiredImpression: text('desired_impression').notNull().default(''),
    context: text('context').notNull().default(''),
    brandProfileId: uuid('brand_profile_id').references(() => brandProfiles.id, {
      onDelete: 'set null',
    }),
    result: jsonb('result').$type<AnyReport | null>(),
    model: text('model').notNull().default(''),
    confidence: real('confidence'),
    isFavourite: boolean('is_favourite').notNull().default(false),
    status: text('status').notNull().default('processing'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('analyses_user_id_idx').on(table.userId),
    createdIdx: index('analyses_user_created_idx').on(table.userId, table.createdAt),
  })
)

export const analysisImages = pgTable(
  'analysis_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    analysisId: uuid('analysis_id')
      .notNull()
      .references(() => analyses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    originalName: text('original_name').notNull(),
    mimeType: text('mime_type').notNull(),
    byteSize: bigint('byte_size', { mode: 'number' }).notNull(),
    imageRole: text('image_role').notNull().default('primary'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    analysisIdx: index('analysis_images_analysis_id_idx').on(table.analysisId),
  })
)

export const shareLinks = pgTable(
  'share_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    analysisId: uuid('analysis_id')
      .notNull()
      .references(() => analyses.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    revealImages: boolean('reveal_images').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => ({
    slugIdx: uniqueIndex('share_links_slug_key').on(table.slug),
    analysisIdx: index('share_links_analysis_id_idx').on(table.analysisId),
  })
)

export const usageEvents = pgTable(
  'usage_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    model: text('model').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userCreatedIdx: index('usage_events_user_created_idx').on(table.userId, table.createdAt),
  })
)

export type UserRow = typeof users.$inferSelect
export type BrandProfileRow = typeof brandProfiles.$inferSelect
export type AnalysisRow = typeof analyses.$inferSelect
export type AnalysisImageRow = typeof analysisImages.$inferSelect
export type ShareLinkRow = typeof shareLinks.$inferSelect
