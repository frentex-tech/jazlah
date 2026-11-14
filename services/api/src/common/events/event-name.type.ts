/**
 * An event name: `domain.entity.action`, lowercase, the action in the past tense
 * (`orders.order.placed`). The type checks the three parts; the words are a review rule.
 */
export type EventName = `${string}.${string}.${string}`;
