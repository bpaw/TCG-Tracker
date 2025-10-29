import { Event } from '../../../domain/types';
import { Repository } from '../interfaces';

/**
 * Cloud-based Event Repository (Not Implemented)
 *
 * This is a stub for future cloud storage implementation.
 * When implemented, this would sync data with a remote server/cloud service.
 */
export class CloudEventRepository implements Repository<Event> {
  async list(): Promise<Event[]> {
    throw new Error('CloudEventRepository.list() not implemented');
  }

  async get(id: string): Promise<Event | null> {
    throw new Error('CloudEventRepository.get() not implemented');
  }

  async create(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    throw new Error('CloudEventRepository.create() not implemented');
  }

  async update(id: string, data: Partial<Event>): Promise<Event | null> {
    throw new Error('CloudEventRepository.update() not implemented');
  }

  async remove(id: string): Promise<boolean> {
    throw new Error('CloudEventRepository.remove() not implemented');
  }
}
