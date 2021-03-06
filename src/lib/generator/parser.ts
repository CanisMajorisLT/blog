import * as MarkdownIt from 'markdown-it';
import * as markdownItHighlight from 'markdown-it-highlightjs';
import * as markdownItFootnote from 'markdown-it-footnote';
import * as mdMetaParser from 'markdown-yaml-metadata-parser';
import * as moment from 'moment';

import { ParsedArticle, MetaData } from './commonTypes';

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  breaks: true,
  langPrefix: 'lang-',
  linkify: true,
  typographer: true,
});

md.use(markdownItFootnote).use(markdownItHighlight);

function extractSummary(content: string) {
  const firstParagraph = content.trim().split('\n\n')[0];
  return `${firstParagraph.slice(0, 200)}...`
}

function addSummary(metaData: MetaData, content: string): void {
  if (!metaData.summary) {
    metaData.summary = extractSummary(content);
  }
}

function formatMetaData(metaData: MetaData): void {
  metaData.date = moment(metaData.date).format('MMM DD, YYYY');
  metaData.id = `${metaData.id}`;
}

export function parseArticle(articleSource: string): ParsedArticle {
  const { metadata: metaData, content } = mdMetaParser(articleSource);
  const articleHtml = md.render(content);

  addSummary(metaData, content);
  formatMetaData(metaData);

  return {
    metaData,
    articleHtml,
  };
}
