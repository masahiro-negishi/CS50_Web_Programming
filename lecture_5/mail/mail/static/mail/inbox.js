document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email(-1));

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email(id) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#one-mail-view').style.display = 'none';

    // Three input fields and submit button
    const recipients = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');
    const submit = document.querySelector('#compose-form > input');

    // Clear out composition fields
    recipients.value = '';
    subject.value = '';
    body.value = '';

    // Set default inputs when this email is a reply to another
    if (id !== -1) {
        fetch(`emails/${id}`)
        .then(response => response.json())
        .then(original => {
            recipients.value = original.sender;
            if (original.subject.substr(0, 4) === 'Re: ') {
                subject.value = original.subject;
            }
            else {
                subject.value = 'Re: ' + original.subject;
            }
            body.value = `On ${original.timestamp} ${original.sender} wrote: ${original.body}`;
        })
    }

    // Disable submit button by default if recipients is not specified
    if (id !== -1) {
        submit.disabled = false;
    }
    else {
        submit.disabled = true;
    }
    
    // Listen for input to be typed into the recipient field
    recipients.onkeyup = () => {
        if (recipients.value.length > 0) {
            submit.disabled = false;
        }
        else {
            submit.disabled = true;
        }
    }

    // Listen for submission of form
    document.querySelector('#compose-form').onsubmit = () => {

        // Receive inputs
        const new_recipients = recipients.value;
        const new_subject = subject.value;
        const new_body = body.value;

        // Send email
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: new_recipients,
                subject: new_subject,
                body: new_body
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            load_mailbox('sent');
        })
        .catch(error => {
            console.log('Error: ', error);
        });

        // Prevent default submission
        return false;
    }
}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#one-mail-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Read mailbox
    fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        for (let i = 0; i < emails.length; i++){
            const one_mail = document.createElement('div');

            // Set boarder between each mail
            one_mail.style.border = 'thin solid black';
            one_mail.style.padding = '10px';

            // Show sender, subject, and timestamp
            const sender = document.createElement('span');
            const subject = document.createElement('span');
            sender.innerHTML = emails[i].sender;
            subject.innerHTML = emails[i].subject;
            sender.style.fontWeight = 'bold';
            subject.style.padding = '10px';

            const sender_subject = document.createElement('div');
            const timestamp = document.createElement('div');
            sender_subject.style.display = 'inline-block';
            timestamp.style.display = 'inline-block';
            sender_subject.appendChild(sender);
            sender_subject.appendChild(subject);
            timestamp.innerHTML = emails[i].timestamp;

            sender_subject.style.width = '60%';
            timestamp.style.width = '40%';
            timestamp.style.textAlign = 'right';
            /*
            if (mailbox === 'sent') {
                timestamp.style.width = '40%';
            }
            else {
                timestamp.style.width = '30%';
            }
            */
            one_mail.appendChild(sender_subject);
            one_mail.appendChild(timestamp);
            /*
            // Set button for archive or unarchive
            if (mailbox !== 'sent') {
                const push = document.createElement('button');
                push.style.cursor = 'pointer';
                push.style.marginLeft = '2px';
                //push.style.padding = '2%';
                push.innerHTML = 'archive'
                push.addEventListener('click', () => {
                    console.log('here');
                })
                one_mail.appendChild(push)
            }
            */
            // Set background color depending on whether emails[i] has been read or not
            if (emails[i].read) {
                one_mail.style.backgroundColor = 'gray';
            }
            else {
                one_mail.style.backgroundColor = 'white';
            }

            //Add an event listener to one_mail
            one_mail.style.cursor = 'pointer';
            one_mail.addEventListener('click', () => {
                show_one_mail(emails[i].id, mailbox);
            })

            document.querySelector('#emails-view').append(one_mail);
        }
    })
    .catch(error => {
        console.log('Error: ', error)
    })
}

function show_one_mail(id, mailbox) {

    // Show the one-mail-view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#one-mail-view').style.display = 'block';

    //Clear out one-mail-view
    document.querySelector('#one-mail-view').innerHTML = '';

    // Get particular mail
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(one_mail => {

        // Show information about one_mail
        const frame = document.querySelector('#one-mail-view');
        const titles = ['From', 'To', 'Subject', 'Timestamp'];
        const contents = [one_mail.sender, one_mail.recipients, one_mail.subject, one_mail.timestamp];
        for (let i = 0; i < 4; i++) {
            const line = document.createElement('div');
            let title = document.createElement('span');
            let content = document.createElement('span');
            title.innerHTML = `${titles[i]}: `;
            title.style.fontWeight = 'bold';
            content.innerHTML = contents[i]; 
            line.appendChild(title);
            line.appendChild(content);
            frame.appendChild(line);
        }

        // Set button for archive or unarchive
        if (mailbox !== 'sent') {
            const push = document.createElement('button');
            push.style.cursor = 'pointer';
            push.style.margin = '10px';
            push.className = 'btn btn-sm btn-outline-primary';
            var set_value;
            if (mailbox === 'inbox') {
                push.innerHTML = 'Archive';
                set_value = true;
            }
            else {
                push.innerHTML = 'Unarchive';
                set_value = false;
            }
            push.addEventListener('click', () => {
                fetch(`emails/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: set_value
                    })
                })
                .catch(error => {
                    console.log('Error: ', error);
                })
                // Back to inbox after 100 ms wait
                // wait long enough that change is reflected 
                setTimeout('load_mailbox("inbox")', 100);
            })
            frame.appendChild(push);
        }

        // Set button for reply
        const reply = document.createElement('button');
        reply.style.cursor = 'pointer';
        reply.style.margin = '10px';
        reply.innerHTML = 'Reply';
        reply.className = 'btn btn-sm btn-outline-primary';
        reply.addEventListener('click', () => {
            compose_email(id);
        })
        frame.appendChild(reply);

        // Add horizontal line
        frame.appendChild(document.createElement('hr'));

        // Show body
        const body = document.createElement('div');
        body.innerHTML = one_mail.body;
        frame.appendChild(body);

        // Make the state of one_mail read
        fetch(`emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
        })
        .catch(error => {
            console.log('Error: ', error);
        })
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}