import { useState, ChangeEventHandler } from 'react'
import {
	atom,
	selector,
	useRecoilState,
	useRecoilValue,
	useSetRecoilState,
} from 'recoil'

type _TodoItem = {
	id: number
	text: string
	isComplete: boolean
}

type FilterState = 'Show All' | 'Show Completed' | 'Show Uncompleted'

function getId() {
	let id = 0

	return {
		increaase: () => id++,
	}
}

const { increaase } = getId()

function replaceItemAtIndex<T>(arr: T[], index: number, newValue: T): T[] {
	return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)]
}

function removeItemAtIndex<T>(arr: T[], index: number): T[] {
	return [...arr.slice(0, index), ...arr.slice(index + 1)]
}

const todoListState = atom<_TodoItem[]>({
	key: 'TodoList',
	default: [],
})

const todoListFiltetState = atom<FilterState>({
	key: 'TodoListFilter',
	default: 'Show All',
})

const filteredTodoListState = selector({
	key: 'FilteredTodoList',
	get: ({ get }) => {
		const filter = get(todoListFiltetState)
		const list = get(todoListState)

		switch (filter) {
			case 'Show Completed':
				return list.filter((item) => item.isComplete)
			case 'Show Uncompleted':
				return list.filter((item) => !item.isComplete)
			default:
				return list
		}
	},
})

const todoListStatsState = selector({
	key: 'TodoListStats',
	get: ({ get }) => {
		const todoList = get(todoListState)
		const totalNum = todoList.length
		const totalCompletedNum = todoList.filter((item) => item.isComplete).length
		const totalUncompletedNum = todoList.filter(
			(item) => !item.isComplete,
		).length
		const percentCompleted =
			totalNum === 0 ? 0 : (totalCompletedNum / totalNum) * 100

		return {
			totalNum,
			totalCompletedNum,
			totalUncompletedNum,
			percentCompleted,
		}
	},
})

function TodoItemCreator() {
	const [inputValue, setInputValue] = useState('')
	const setTodoList = useSetRecoilState(todoListState)

	const handleClick = () => {
		setTodoList((oldTodoList) => [
			...oldTodoList,
			{
				id: increaase(),
				text: inputValue,
				isComplete: false,
			},
		])
		setInputValue('')
	}

	const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		setInputValue(e.target.value)
	}

	return (
		<div>
			<input value={inputValue} onChange={handleChange} />
			<button onClick={handleClick}>Add</button>
		</div>
	)
}

function TodoItem({ item }: { item: _TodoItem }) {
	const [todoList, setTodoList] = useRecoilState(todoListState)
	const index = todoList.findIndex((listItem) => listItem === item)

	const handleChangeText: ChangeEventHandler<HTMLInputElement> = (e) => {
		const newList = replaceItemAtIndex(todoList, index, {
			...item,
			text: e.target.value,
		})

		setTodoList(newList)
	}

	const handleChangeComplete: ChangeEventHandler<HTMLInputElement> = (e) => {
		const newList = replaceItemAtIndex(todoList, index, {
			...item,
			isComplete: !item.isComplete,
		})

		setTodoList(newList)
	}

	const handleClickDelete = () => {
		const newList = removeItemAtIndex(todoList, index)

		setTodoList(newList)
	}

	return (
		<div>
			<input value={item.text} onChange={handleChangeText} />
			<input
				type='checkbox'
				checked={item.isComplete}
				onChange={handleChangeComplete}
			/>
			<button onClick={handleClickDelete}>X</button>
		</div>
	)
}

function TodoListFilters() {
	const [filter, setFilter] = useRecoilState(todoListFiltetState)

	const handleChangeFilter: ChangeEventHandler<HTMLSelectElement> = (e) => {
		setFilter(e.target.value as FilterState)
	}

	return (
		<>
			Filter:
			<select value={filter} onChange={handleChangeFilter}>
				<option value='Show All'>All</option>
				<option value='Show Completed'>Completed</option>
				<option value='Show Uncompleted'>Uncompleted</option>
			</select>
		</>
	)
}

function TodoListStats() {
	const { totalNum, totalCompletedNum, totalUncompletedNum, percentCompleted } =
		useRecoilValue(todoListStatsState)
	const formattedPercentCompleted = Math.round(percentCompleted)

	return (
		<ul>
			<li>Total items: {totalNum}</li>
			<li>Items completed: {totalCompletedNum}</li>
			<li>Items not completed: {totalUncompletedNum}</li>
			<li>Percent completed: {formattedPercentCompleted}</li>
		</ul>
	)
}

function TodoList() {
	const todoList = useRecoilValue(filteredTodoListState)

	return (
		<>
			{todoList.map((todoItem) => (
				<TodoItem key={todoItem.id} item={todoItem} />
			))}
		</>
	)
}

function App() {
	return (
		<>
			<TodoItemCreator />
			<TodoListFilters />
			<TodoListStats />
			<TodoList />
		</>
	)
}

export default App
