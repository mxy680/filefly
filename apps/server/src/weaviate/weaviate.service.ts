// src/weaviate/weaviate.provider.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import weaviate, { WeaviateClient } from 'weaviate-client';

@Injectable()
export class WeaviateService implements OnModuleInit {
    private client: WeaviateClient;

    async onModuleInit() {
        await this.initializeClient();
    }

    private async initializeClient() {
        // Initialize the Weaviate client with Weaviate Cloud credentials
        this.client = await weaviate.connectToWeaviateCloud(process.env.WEAVIATE_URL,
            {
                authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
                headers: {
                    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
                }
            }
        );
    }

    async getClient(): Promise<WeaviateClient> {
        if (!this.client || !(await this.client.isReady())) {
            throw new Error('Weaviate client is not initialized');
        }
        return this.client;
    }

    async getCollection(name: string, tenant: Number = 0) {
        const client = await this.getClient();
        return client.collections.get(name).withTenant(tenant.toString());
    }

    async addTenant(tenant: Number) {
        const client = await this.getClient();
        
        // Get all collections
        const collections = await client.collections.listAll()

        // Add the tenant to each collection
        collections.map(async (collectionData) => {
            const collection = await client.collections.get(collectionData.name);
            await collection.tenants.create([{ name: tenant.toString() }]);
        });
    }

    async insert(collectionName: string, data: any[], tenant: Number) {
        console.log('Inserting file for tenant:', tenant);
        const collection = await this.getCollection(collectionName, tenant);
        if (data.length === 1) {
            return await collection.data.insert(data[0]);
        } else {
            return await collection.data.insertMany(data);
        }

    }
}
