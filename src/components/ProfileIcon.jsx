// src/components/ProfileIcon.jsx
// A profile icon drawn as a mark: a line icon for the preset icons, the badge medallion for "badge:<id>" icons.
// Use this instead of the emoji that resolveProfileIcon() still returns for older screens.
import { Zap, BookOpen, Pencil, Flame, Gem, Trophy, Rocket, Star, Crown, Brain, Bot, Diamond } from 'lucide-react'
import { LazyBadgeArt } from './illustrations/lazy'
import { resolveProfileIcon } from '../data/themes'

const MARKS = {
  lightning: Zap, book: BookOpen, pencil: Pencil, fire: Flame, diamond: Gem, trophy: Trophy,
  rocket: Rocket, star: Star, crown: Crown, brain: Brain, robot: Bot, gem: Diamond,
}

export default function ProfileIcon({ id, size = 24, earned = true }) {
  const icon = resolveProfileIcon(id)
  if (icon.badgeId) return <LazyBadgeArt id={icon.badgeId} size={size} earned={earned} />
  const Mark = MARKS[icon.id] || Zap
  return <Mark size={size} aria-hidden="true" />
}
