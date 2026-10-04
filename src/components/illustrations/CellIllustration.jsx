// src/components/illustrations/CellIllustration.jsx
// Forwarding shim: Landing.jsx imports this path directly. Renders the biology artwork from the
// shared system. Delete once Landing.jsx imports SubjectIllustration instead.
import React from 'react'
import SubjectIllustration from './SubjectIllustration'

export default function CellIllustration(props) {
  return <SubjectIllustration theme="biology" {...props} />
}
