const gel = (id) => { return document.getElementById(id) }
const cel = (root = document.body, tag = 'div', cname) => {
	const res = document.createElement(tag)
	if (!!res) {
		if (!!root) {
			root.appendChild(res)
		}
		if (!!cname) {
			res.className = cname
		}
	}
	return res
}

const id_gen = (initial = 0) => {
	let id = initial
	return () => {
		return id++
	}
}

const uuid = id_gen(42)

const add_comment = (
	id = 0,
	repl = null,
	from = '',
	text = ''
) => ({id, repl, from, text})

const post = {
	id: null,
	from: 'OP',
	title: 'My wonderful post!',
	text: 'Реализация, конечно, говно, но ключевая идея такова: нахуя строить "лестницы", в диалогах? То есть, когда люди последовательно отвечают друг другу.',
}

const comments = [
	/* add_comment(1, null, 'A', 'Kitties are cute'),
	add_comment(2, 1, 'B', 'No they are not'),
	add_comment(3, 2, 'A', 'Why?'),
	add_comment(4, 3, 'B', 'Because'),

	add_comment(5, null, 'C', 'So true'),
	add_comment(6, null, 'D', 'I have an opinnion of my own'),

	add_comment(7, 2, 'E', 'Just like you'),

	add_comment(8, 7, 'F', 'Ya\'ll wrong'),

	add_comment(9, 2, 'G', 'Yes they are'),
	add_comment(10, 9, 'B', 'NO'),

	add_comment(11, null, 'OP', 'Well that escalated fast'),
	add_comment(12, 2, 'OP', 'Why so grumpy?'),
	add_comment(13, 7, 'B', 'NO U'), */
]

const toggle_reply = (show = false) => {
	if (show) {
		gel('repl').classList.remove('hidden')
	} else {
		gel('repl').classList.add('hidden')
	}
	gel('user-name').value = ''
	gel('answer-text').value = ''
}

const reply_handler = (target) => {
	return () => {
		toggle_reply(true)
		gel('send-reply').onclick = () => { add_reply(target) }
		setTimeout(() => {
			gel('user-name').focus()
		}, 0)
	}
}

const add_reply = (target) => {
	const comm = add_comment(
		uuid(),
		target,
		gel('user-name').value,
		gel('answer-text').value,
	)
	comments.push(comm)
	build_tree()
	toggle_reply(false)
}

const text_block = (body, data) => {
	const el = cel(body)
	el.className = 'comm'

	if (data.title !== undefined) {
		const title = cel(el, 'h3')
		title.textContent = data.title
	}

	const auth = cel(el, 'div', 'auth')
	auth.textContent = `${data.from}`

	if (!!data.repl) {
		const answ = cel(auth, 'span', 'repl')
		answ.textContent = `is replying to ${data.parent.from}`
	}

	const cont = cel(el, 'div', 'text')
	cont.textContent = data.text

	const crud = cel(el, 'div', 'crud')
	const repl = cel(crud, 'button')
	repl.textContent = 'reply'
	repl.onclick = reply_handler(data?.id)

	return el
}

const create_comm = (comm, root) => {
	const for_me = comm?.parent?.parent?.from === comm.from
	
	const dest = comm?.parent?.answers || root
	
	const block = cel(dest)
	block.className = [!for_me && 'branch', for_me && 'resume'].filter(el => !!el).join(' ')

	if (!for_me) {
		const coll = cel(block)
		//coll.textContent = '+'
		coll.className = 'column'
	}

	const body = cel(block)
	body.className = ['body'].filter(el => !!el).join(' ')

	/* const text = cel(body)
	text.className = ['comm'].filter(el => !!el).join(' ')
	text.textContent = `${comm.from} > ${comm?.parent?.from} : ${comm.text}` */
	const text = text_block(body, comm)

	const reps = cel(body)
	reps.className = 'rep-box'

	comm['answers'] = reps
}

const build_tree = () => {
	gel('comm').innerHTML = ''
	const root = cel(gel('comm'))
	
	// build tree
	// const tree = {root: create_comm(post, root)}
	text_block(root, post)
	const tree = {root: {answers: root, from: 'OP'}}

	comments.forEach(comm => {
		tree[comm.id] = comm
		comm.parent = !!comm.repl
			? tree[comm.repl]
			: tree.root
	})

	comments.forEach(comm => create_comm(comm, root))

	console.log(tree)
}

build_tree()