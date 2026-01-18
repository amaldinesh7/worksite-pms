import {
  organizationRepository,
  type CreateOrganizationData,
  type UpdateOrganizationData,
  type OrganizationListOptions,
  type AddMemberData,
  type UpdateMemberRoleData,
  type FindByIdOptions,
} from '../repositories/organization.repository';

/**
 * Organization Service
 *
 * Handles business logic for organization operations.
 * Currently delegates to repository, but provides a clear place for:
 * - Pre/post operation hooks
 * - Cross-cutting concerns (audit logging, notifications)
 * - Complex business rules
 */
export class OrganizationService {
  /**
   * Create a new organization with default categories.
   */
  async create(data: CreateOrganizationData) {
    // Pre-create logic could go here (validation, etc.)

    const organization = await organizationRepository.create(data);

    // Post-create logic could go here (audit log, notifications, etc.)

    return organization;
  }

  async findById(id: string, options?: FindByIdOptions) {
    return organizationRepository.findById(id, options);
  }

  async findAll(options?: OrganizationListOptions) {
    return organizationRepository.findAll(options);
  }

  async update(id: string, data: UpdateOrganizationData) {
    return organizationRepository.update(id, data);
  }

  async delete(id: string) {
    // Pre-delete logic could go here (check for active projects, etc.)

    await organizationRepository.delete(id);

    // Post-delete logic could go here (cleanup external resources, etc.)
  }

  // Member management
  async addMember(organizationId: string, data: AddMemberData) {
    return organizationRepository.addMember(organizationId, data);
  }

  async getMembers(organizationId: string) {
    return organizationRepository.getMembers(organizationId);
  }

  async updateMemberRole(organizationId: string, userId: string, data: UpdateMemberRoleData) {
    return organizationRepository.updateMemberRole(organizationId, userId, data);
  }

  async removeMember(organizationId: string, userId: string) {
    return organizationRepository.removeMember(organizationId, userId);
  }

  async findByUserId(userId: string) {
    return organizationRepository.findByUserId(userId);
  }
}

export const organizationService = new OrganizationService();
