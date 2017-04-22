import { ContainerIds, containerPrefix } from './constants';
import { ParsedArticle } from '../lib/generator/commonTypes';

export function article(article: ParsedArticle): string {
    return `<article class="blog-post">
                <h1 class="blog-post-title">${article.metaData.title}</h1>
                <div class="blog-post-date">${article.metaData.date}</div>
                ${article.articleHtml}
            </article>`;
}