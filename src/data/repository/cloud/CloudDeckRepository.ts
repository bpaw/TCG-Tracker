import { Deck } from '../../../domain/types';
import { Repository } from '../interfaces';

/**
 * Cloud-based Deck Repository (Not Implemented)
 *
 * This is a stub for future cloud storage implementation.
 * When implemented, this would sync data with a remote server/cloud service.
 */
export class CloudDeckRepository implements Repository<Deck> {
  async list(): Promise<Deck[]> {
    throw new Error('CloudDeckRepository.list() not implemented');
  }

  async get(id: string): Promise<Deck | null> {
    throw new Error('CloudDeckRepository.get() not implemented');
  }

  async create(data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    throw new Error('CloudDeckRepository.create() not implemented');
  }

  async update(id: string, data: Partial<Deck>): Promise<Deck | null> {
    throw new Error('CloudDeckRepository.update() not implemented');
  }

  async remove(id: string): Promise<boolean> {
    throw new Error('CloudDeckRepository.remove() not implemented');
  }
}
