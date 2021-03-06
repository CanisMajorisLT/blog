import { existingComment } from '../templates/comments/existingComment';
import { urlBase } from './lib';

const FORM_CLASS_SELECTOR = 'form.new-comment';
const REPLY_BTN_SELECTOR = '.add-reply a';
const PARENT_SELECTOR = '[name="parent"]';
const INNER_WRAP_SELECTOR = '.inner-wrap'; // used for focusing / showing comment when click on reply

const COMMENTS_CONTAINER_CLASS = 'comments-container';
const REPLIES_CONTAINER_CLASS = 'replies';
// TODO: Bugs: <a> is triggering router
interface CommentFormValues {
  name: string;
  comment: string;
  parent: string;
  articleId: string;
  createdAt: string;
}

interface Comment extends CommentFormValues {
  id: string;
  comments: any[];
}

interface ServerPostResponse extends Response {
  isSuccessful: boolean;
  commentId: string;
}

function $(selector: string, el: Element | Document = document): HTMLInputElement {
  const base = el;
  return <HTMLInputElement>base.querySelector(selector);
}

async function sendToServer(
  comment: CommentFormValues,
): Promise<{ isSuccessful: boolean; commentId?: string }> {
  try {
    const r = await (<Promise<
      ServerPostResponse
    >>fetch(`${urlBase}/comments/${comment.articleId}`, {
      method: 'POST',
      body: JSON.stringify(comment),
      mode: 'cors',
      headers: new Headers({
        'content-type': 'application/json',
      }),
    }));
    if (r.status === 200) {
      return r.json();
    }
    return { isSuccessful: false };
  } catch (e) {
    return { isSuccessful: false };
  }
}

function enhanceCommentFormValues(comment: CommentFormValues): Comment {
  return Object.assign({}, comment, { comments: [], id: `temp-${Date.now()}` });
}

function getRepliesContainer(form: Element) {
  const parent = form.parentElement.parentElement.parentElement;
  if (
    parent.parentElement.parentElement.lastElementChild.classList.contains(REPLIES_CONTAINER_CLASS)
  ) {
    return parent.parentElement.parentElement.lastElementChild;
  } else {
    return parent.lastElementChild;
  }
}

function showCommentActionMsg(commentEl: Element, isPositive: boolean) {
  const msg = document.createElement('div');
  msg.innerText = isPositive ? 'Saved!' : 'Failed to save :(';
  msg.className = `coment-msg ${isPositive ? 'is-positive' : 'is-negative'}`;
  commentEl.appendChild(msg);
  setTimeout(() => commentEl.removeChild(msg), 4000);
}

function appendComment(comment: Comment, form: Element) {
  let commentContainer;
  if (form.parentElement.getAttribute('class') === COMMENTS_CONTAINER_CLASS) {
    // reply to article
    commentContainer = $(`.${COMMENTS_CONTAINER_CLASS}`);
  } else {
    // reply to comment
    commentContainer = getRepliesContainer(form);
  }
  commentContainer.innerHTML += existingComment(comment, comment.articleId);

  return {
    successfullyCreated(articleId: string) {
      const commentEl: Element = document.getElementById(comment.id);
      const parentInput: HTMLFormElement = <HTMLFormElement>commentEl.querySelector(
        PARENT_SELECTOR,
      );
      const replyBtn: Element = commentEl.querySelector(REPLY_BTN_SELECTOR);

      commentEl.setAttribute('id', articleId);
      parentInput.setAttribute('value', articleId);
      replyBtn.setAttribute('href', `#${articleId}`);
      showCommentActionMsg(commentEl, true);
    },
    failedToCreate() {
      const commentEl: Element = document.getElementById(comment.id);
      showCommentActionMsg(commentEl, false);
    },
  };
}

function getFormValue(form: Element): CommentFormValues {
  const val = (el: HTMLInputElement | null): string => (el ? el.value : '');

  const name = val($('[name="name"]', form));
  const comment = val($('[name="comment"]', form));
  const parent = val($('[name="parent"]', form));
  const articleId = form.getAttribute('data-articleId');
  const createdAt = new Date().toString();
  return {
    name,
    comment,
    parent,
    articleId,
    createdAt,
  };
}

function addCommentOnSubmit() {
  const listenerRemovers = [];
  let hideOpenReply;

  const commentForms: Element[] = Array.from(document.querySelectorAll(FORM_CLASS_SELECTOR));

  const addFormVisibilityToggleOnReplyClick = () => {
    Array.from(document.querySelectorAll('a.reply-btn')).forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        hideOpenReply && hideOpenReply();
        const target = document.getElementById(a.getAttribute('href').slice(1));
        target.classList.add('show-reply');
        hideOpenReply = () => target.classList.remove('show-reply');
      }),
    );
  };

  const interceptFormSubmit = (form: Element): void => {
    const listener = async (ev) => {
      ev.preventDefault();
      hideOpenReply && hideOpenReply();
      const commentData = getFormValue(form);
      const commentComponent = appendComment(enhanceCommentFormValues(commentData), form);
      const { isSuccessful, commentId } = await sendToServer(commentData);
      if (isSuccessful) {
        commentComponent.successfullyCreated(commentId);
      } else {
        commentComponent.failedToCreate();
      }
      listenerRemovers.forEach((r) => r());
      addCommentOnSubmit();
    };

    form.addEventListener('submit', listener);
    listenerRemovers.push(() => form.removeEventListener('submit', listener));
  };

  addFormVisibilityToggleOnReplyClick();
  commentForms.forEach(interceptFormSubmit);
}

function enhanceComments() {
  addCommentOnSubmit();
}

export default enhanceComments;
