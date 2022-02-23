// Start with first post
let posts_num = 0;

// Load posts 10 at a time
const quantity = 10;

// Username 
let username = "";

// Visitor
let visitor_name = "";

// Processes executed when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    // "Previous" button is not shown at first
    document.querySelector('#previous').style.display = 'none';

    // Set username
    username = document.querySelector('#username').value;

    // Set visitor
    visitor_name = document.querySelector('#visitor_name').value;

    // Set active either "Follow" button or "Unfollow" button
    check_follow();

    // Render the first 10 posts
    load('next');
});

// If "Previous" button is pushed, show the previous 10 posts
// If "Next" button is pushed, show the next 10 posts
document.addEventListener('click', event => {
    const element = event.target;
    if (element.id === 'previous') {
        load('previous');
    }
    else if(element.id === 'next') {
        load('next');
    }
    else if(element.id === 'follow_button') {
        follow();
    }
    else if(element.id === 'unfollow_button') {
        unfollow();
    }
    else if(element.className === 'edit_button btn btn-sm btn-primary') {
        edit(element.parentElement);
    }
    else if(element.className === 'save_button btn btn-sm btn-primary') {
        save_text(element.parentElement);
    }
    else if(element.className === 'like_icon_off') {
        like(element.parentElement.parentElement, 'like');
        element.style.animationPlayState = 'running';
        element.addEventListener('animationend', () => {
            element.className = '';
            element.className = 'like_icon_on';
        })
    }
    else if(element.className === 'like_icon_on') {
        like(element.parentElement.parentElement, 'unlike');
        element.className = '';
        element.className = 'like_icon_off';
        element.style.animationPlayState = 'paused';
    }
})

// Load 10 posts
function load(type) {
    // Decide start post
    let start = 0;
    if (type === 'next') {
        start = posts_num;
    }
    else {
        if (posts_num % quantity === 0) {
            start = posts_num - 2 * quantity;
        }
        else {
            start = Math.floor((posts_num/quantity))*quantity - quantity;
        }
    }

    // Get posts from DB through API
    fetch(`../get_posts_user/${username}/${start}`)
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(posts => {
        // Clean up posts shown at present
        document.querySelector('.userposts').innerHTML = '';

        // Show posts
        for (let i = 0; i < posts.length; i++){
            const one_post = document.createElement('div');
            one_post.className = 'border rounded';

            // Make html element for poster, content, text, time, and likes
            const poster = document.createElement('a');
            const content = document.createElement('div');
            const time = document.createElement('div');
            const like = document.createElement('div');
            const like_icon = document.createElement('div');
            const like_num = document.createElement('div');
            poster.className = 'poster';
            content.className = 'content';
            time.className = 'timestamp';
            like.className = 'like';
            if (posts[i].visitor_like) {
                like_icon.className = 'like_icon_on';
            }
            else {
                like_icon.className = 'like_icon_off';
            }
            like_num.className = 'like_num';
            poster.href = `profile/${posts[i].user}`;
            poster.innerHTML = posts[i].user;
            content.innerHTML = posts[i].body;
            time.innerHTML = posts[i].timestamp;
            like_num.innerHTML = posts[i].likes_num;
            like_icon.innerHTML = '';
            like.appendChild(like_icon);
            like.appendChild(like_num);

            // Writer can edit the post
            if (visitor_name === posts[i].user) {
                
                const text = document.createElement('textarea');
                const edit = document.createElement('button');
                const save = document.createElement('button');
                edit.className = 'edit_button btn btn-sm btn-primary';
                edit.innerHTML = 'Edit';
                save.className = 'save_button btn btn-sm btn-primary';
                save.innerHTML = 'Save';
                text.className = 'text';
                text.style.display = 'none';
                save.style.display = 'none';
                one_post.appendChild(poster);
                one_post.appendChild(content);
                one_post.appendChild(text);
                one_post.appendChild(time);
                one_post.appendChild(edit);
                one_post.appendChild(save);
                one_post.appendChild(like);
            }
            // Others cannot
            else {
                one_post.appendChild(poster);
                one_post.appendChild(content);
                one_post.appendChild(time);
                one_post.appendChild(like);
            }

            // Save id
            const id = document.createElement('div');
            id.innerHTML = posts[i].id;
            id.className = 'id';
            id.style.display = 'none';
            one_post.appendChild(id);

            // Add one_post to the profile page
            document.querySelector('.userposts').appendChild(one_post);
        }

        // Update posts_num
        posts_num = start + posts.length;

        // Show "Previous" button if there are newer posts
        if (posts_num > quantity) {
            document.querySelector('#previous').style.display = 'block';
        }
        else {
            document.querySelector('#previous').style.display = 'none';
        }
    })
    .catch(error => {
        console.log('Error: ', error);
        alert('There is not older post any more')
    })
}

// Check whether user visiting this page already follows the target or not
function check_follow() {

    fetch(`../check_follow/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(result => {
        if (result.follow === 'true') {
            document.querySelector("#follow_button").style.display = 'none';
            document.querySelector("#unfollow_button").style.display = 'block';
        }
        else {
            document.querySelector("#follow_button").style.display = 'block';
            document.querySelector("#unfollow_button").style.display = 'none';
        }
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}

// Follow 
function follow() {
    fetch(`../follow/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(result => {
        console.log(result);
        document.querySelector("#follow_button").style.display = 'none';
        document.querySelector("#unfollow_button").style.display = 'block';
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}

// Unfollow 
function unfollow() {
    fetch(`../unfollow/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(result => {
        console.log(result);
        document.querySelector("#follow_button").style.display = 'block';
        document.querySelector("#unfollow_button").style.display = 'none';
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}

// Edit 
function edit(post) {
    post.querySelector('.text').style.display = 'block';
    post.querySelector('.save_button').style.display = 'block';
    post.querySelector('.text').innerHTML = post.querySelector('.content').innerHTML;
    post.querySelector('.edit_button').style.display = 'none';
    post.querySelector('.content').style.display = 'none';
}

// Get Cookie
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Save
function save_text(post) {
    
    id = post.querySelector('.id').innerHTML;
    content = post.querySelector('.text').value;
    data = JSON.stringify({
        id: id,
        content: content
    })
    let csrftoken = getCookie('csrftoken');
    // Apply changes to DB
    fetch('../save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        post.querySelector('.text').style.display = 'none';
        post.querySelector('.save_button').style.display = 'none';
        post.querySelector('.content').innerHTML = data.body;
        post.querySelector('.timestamp').innerHTML = data.timestamp;
        post.querySelector('.edit_button').style.display = 'block';
        post.querySelector('.content').style.display = 'block';
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}

// Like or Unlike
function like(post, type) {
    id = post.querySelector('.id').innerHTML;
    next_like = false;
    if (type === 'like') {
        next_like = true;
    }
    data = JSON.stringify({
        id: id,
        like: next_like
    })
    let csrftoken = getCookie('csrftoken');
    // Apply changes to DB
    fetch('../like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        post.querySelector('.like_num').innerHTML = data.likes_num;
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}