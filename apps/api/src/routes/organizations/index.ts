import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  AddMemberSchema,
  UpdateMemberRoleSchema,
  OrganizationIdParams,
  MemberParams,
  OrganizationListQuery,
} from './organization.schema';
import {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from './organization.controller';

export default async function organizationRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // ============================================
  // Organization CRUD
  // ============================================

  // GET /api/organizations - List all organizations
  app.get(
    '/',
    {
      schema: {
        querystring: OrganizationListQuery,
      },
    },
    listOrganizations
  );

  // GET /api/organizations/:id - Get organization by ID
  app.get(
    '/:id',
    {
      schema: {
        params: OrganizationIdParams,
      },
    },
    getOrganization
  );

  // POST /api/organizations - Create organization
  app.post(
    '/',
    {
      schema: {
        body: CreateOrganizationSchema,
      },
    },
    createOrganization
  );

  // PUT /api/organizations/:id - Update organization
  app.put(
    '/:id',
    {
      schema: {
        params: OrganizationIdParams,
        body: UpdateOrganizationSchema,
      },
    },
    updateOrganization
  );

  // DELETE /api/organizations/:id - Delete organization
  app.delete(
    '/:id',
    {
      schema: {
        params: OrganizationIdParams,
      },
    },
    deleteOrganization
  );

  // ============================================
  // Member Management
  // ============================================

  // GET /api/organizations/:id/members - List members
  app.get(
    '/:id/members',
    {
      schema: {
        params: OrganizationIdParams,
      },
    },
    listMembers
  );

  // POST /api/organizations/:id/members - Add member
  app.post(
    '/:id/members',
    {
      schema: {
        params: OrganizationIdParams,
        body: AddMemberSchema,
      },
    },
    addMember
  );

  // PUT /api/organizations/:id/members/:userId - Update member role
  app.put(
    '/:id/members/:userId',
    {
      schema: {
        params: MemberParams,
        body: UpdateMemberRoleSchema,
      },
    },
    updateMemberRole
  );

  // DELETE /api/organizations/:id/members/:userId - Remove member
  app.delete(
    '/:id/members/:userId',
    {
      schema: {
        params: MemberParams,
      },
    },
    removeMember
  );
}
