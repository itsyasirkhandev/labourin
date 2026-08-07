import { Context } from 'effect';
import { GenericDatabaseReader, GenericDatabaseWriter, StorageWriter } from 'convex/server';
import { DataModel } from '../_generated/dataModel';

/** @effect-leakable-service */
export class ConvexDB extends Context.Service<
	ConvexDB,
	{ db: GenericDatabaseReader<DataModel> }
>()('ConvexDB') {}

export class ConvexDBWriter extends Context.Service<
	ConvexDBWriter,
	{ db: GenericDatabaseWriter<DataModel> }
>()('ConvexDBWriter') {}

export class ConvexStorageWriter extends Context.Service<
	ConvexStorageWriter,
	{ storage: StorageWriter }
>()('ConvexStorageWriter') {}
