for (let li of list.querySelectorAll('li')) {
    let span = document.createElement('span'); /* создание span */
    span.classList.add('show'); /* добавление класса для span */
    li.prepend(span); /* вставить span внутри li */
    span.append(span.nextSibling) /* присоединить к span следующий узел */
}
list.onclick = function(event) {
    if (event.target.tagName != 'SPAN') return;

    let childrenList = event.target.parentNode.querySelector('ul');
    if (!childrenList) return;
    childrenList.hidden = !childrenList.hidden;

    if (childrenList.hidden) {
        event.target.classList.add('hide');
        event.target.classList.remove('show');
    }

    else {
        event.target.classList.add('show');
        event.target.classList.remove('hide');
    }
}