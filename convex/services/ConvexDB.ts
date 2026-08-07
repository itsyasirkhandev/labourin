import { Context } from 'effect';
import { GenericDatabaseReader, GenericDatabaseWriter } from 'convex/server';
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

