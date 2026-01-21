import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  teamMemberParamsSchema,
  teamMemberQuerySchema,
} from './team.schema';
import * as controller from './team.controller';

export default async function teamRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.addHook('preHandler', organizationMiddleware);

  // GET /api/team - List all team members for organization
  app.get('/', { schema: { querystring: teamMemberQuerySchema } }, controller.listTeamMembers);

  // GET /api/team/:id - Get a team member by ID
  app.get('/:id', { schema: { params: teamMemberParamsSchema } }, controller.getTeamMember);

  // POST /api/team - Create a new team member
  app.post('/', { schema: { body: createTeamMemberSchema } }, controller.createTeamMember);

  // PUT /api/team/:id - Update a team member
  app.put(
    '/:id',
    { schema: { params: teamMemberParamsSchema, body: updateTeamMemberSchema } },
    controller.updateTeamMember
  );

  // DELETE /api/team/:id - Remove a team member from organization
  app.delete('/:id', { schema: { params: teamMemberParamsSchema } }, controller.deleteTeamMember);
}
