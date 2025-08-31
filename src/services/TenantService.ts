import { Repository } from 'typeorm';
import { Tenant } from '../entity/Tenant';
import { ITenant, ITenants } from '../types';

export default class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}

    async create({ name, address }: ITenants) {
        return await this.tenantRepository.save({
            name,
            address,
        });
    }
    async getAll() {
        return await this.tenantRepository.find();
    }
    async getTenantById(tenantId: number) {
        return await this.tenantRepository.findOne({
            where: {
                id: tenantId,
            },
        });
    }
    async deleteById(tenantId: number) {
        const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new Error('Tenant not found');
        }
        return await this.tenantRepository.delete(tenantId);
    }
    async update(id: number, tenantData: ITenant) {
        return await this.tenantRepository.update(id, tenantData);
    }
}
