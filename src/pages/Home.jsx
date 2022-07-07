import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import './home.scss';

export function Home() {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios.get(`${url}/lists`, {
      headers: {
        authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== 'undefined') {
      setSelectListId(listId);
      axios.get(`${url}/lists/${listId}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios.get(`${url}/lists/${id}/tasks`, {
      headers: {
        authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };
  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p><Link to="/list/new">リスト新規作成</Link></p>
              <p><Link to={`/lists/${selectListId}/edit`}>選択中のリストを編集</Link></p>
            </div>
          </div>
          <ul className="list-tab" role={"tablist"}>
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  role="presentation"
                >
                  <button
                      onClick={() => handleSelectList(list.id)}
                      aria-selected={isActive}
                      role={"tab"}
                      tabIndex={key}>
                    {list.title}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select onChange={handleIsDoneDisplayChange} className="display-select">
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks tasks={tasks} selectListId={selectListId} isDoneDisplay={isDoneDisplay} />
          </div>
        </div>
      </main>
    </div>
  );
}

// 表示するタスク
function Tasks(props) {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;

  return (
      <ul role={"tabpanel"}>
        {tasks.filter((task) => (isDoneDisplay === 'done'&&task.done === true)||(isDoneDisplay === 'todo'&&task.done === false))
            .map((task, key) => (
                <li key={key} className="task-item">
                  <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
                    {task.title}
                    <br />
                    {task.done ? '完了' : '未完了'}
                    {task.limit?(
                        <>
                          <br/>
                          期限：{new Date(task.limit.slice(0,-1)+"+09:00").toLocaleString()}
                          <br/>
                          {date2str(task.limit)}
                        </>
                    ):""}
                  </Link>
                </li>
            ))}
      </ul>
  );
}
const date2str = (limitStr)=>{
  const limit = new Date(limitStr.slice(0,-1)+"+09:00").getTime(),now=new Date().getTime();
  if (limit<now) return "期限超過";
  if (limit-now>86400000) return `のこり${Math.floor((limit-now)/86400000)}日`;
  if (limit-now>3600000) return `のこり${Math.floor((limit-now)/3600000)}時間`;
  if (limit-now>60000) return `のこり${Math.floor((limit-now)/60000)}分`;
  return "もうすぐ"
}