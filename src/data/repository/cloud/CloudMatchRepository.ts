import { Match } from '../../../domain/types';
import { Repository } from '../interfaces';

/**
 * Cloud-based Match Repository (Not Implemented)
 *
 * This is a stub for future cloud storage implementation.
 * When implemented, this would sync data with a remote server/cloud service.
 */
export class CloudMatchRepository implements Repository<Match> {
  async list(): Promise<Match[]> {
    throw new Error('CloudMatchRepository.list() not implemented');
  }

  async get(id: string): Promise<Match | null> {
    throw new Error('CloudMatchRepository.get() not implemented');
  }

  async create(data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
    throw new Error('CloudMatchRepository.create() not implemented');
  }

  async update(id: string, data: Partial<Match>): Promise<Match | null> {
    throw new Error('CloudMatchRepository.update() not implemented');
  }

  async remove(id: string): Promise<boolean> {
    throw new Error('CloudMatchRepository.remove() not implemented');
  }
}
