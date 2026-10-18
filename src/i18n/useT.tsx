import { Fragment } from 'react'
import { useLang } from './LangProvider'
import { UI_TEXT, type Title } from './ui'

export const useT = () => UI_TEXT[useLang().lang]

export function TitleParts({ parts }: { parts: Title }) {
  const [before, em, after] = parts
  return (
    <Fragment>
      {before}
      <em>{em}</em>
      {after}
    </Fragment>
  )
}
