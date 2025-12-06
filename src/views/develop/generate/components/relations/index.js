// Export all relation components
import HasOne from './HasOne.vue'
import HasMany from './HasMany.vue'
import BelongsTo from './BelongsTo.vue'
import BelongsToMany from './BelongsToMany.vue'
import HasOneThrough from './HasOneThrough.vue'
import HasManyThrough from './HasManyThrough.vue'

export default {
  hasOne: HasOne,
  hasMany: HasMany,
  belongsTo: BelongsTo,
  belongsToMany: BelongsToMany,
  hasOneThrough: HasOneThrough,
  hasManyThrough: HasManyThrough
}
