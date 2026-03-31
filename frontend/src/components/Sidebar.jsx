import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/chat-icon.png";
import axios from "axios";
import { API_URL } from "../services/config";
import {
  getConversationHistory,
  deleteConversation,
  updateConversationTitle
} from "../services/chatService";
import {
  FaBars,
  FaChevronLeft,
  FaRegCalendarAlt,
  FaSearch,
  FaPen,
  FaTrash,
  FaEllipsisH
} from "react-icons/fa";
import "../styles/sidebar.css";
import { useNavigate } from "react-router-dom";
import { getUserProfile, createConversation } from "../services/chatService";

function Sidebar() {
  
  const navigate = useNavigate();
  const menuRef = useRef(null);


  const handleLogoClick = async () => {
    try {
      const user = await getUserProfile(); 
      const title = `Conversație nouă - ${new Date().toLocaleString()}`;
      const sender = user.email || "Unknown";
      const response = await createConversation({ user_id: user.id, title, sender }); 
      
      setConversations(prev => [response, ...prev]);
      const newConversationId = response.id;
      navigate(`/chat/${newConversationId}`);
    } catch (err) {
      console.error("Eroare creare conversație:", err);
    }
  };
  

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userEmail, setUserEmail] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const searchInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const toggleMenu = id => setActiveMenu(p => (p === id ? null : id));
  const closeMenu = () => setActiveMenu(null);

  const [modalType, setModalType] = useState(null); // "edit" | "delete" | null
  const [modalConv, setModalConv] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const openEdit  = conv => { setModalType("edit");  setModalConv(conv); setEditTitle(cleanTitle(conv.title)); };
  const openDel   = conv => { setModalType("delete");setModalConv(conv); };
  const closeModal= ()   => { setModalType(null);    setModalConv(null); };

  const saveEdit = async () => {
    try {
      const u = await updateConversationTitle(modalConv.id, editTitle);
      setConversations(p => p.map(c => (c.id===modalConv.id? {...c,title:u.title}:c)));
      closeModal();
    } catch { alert("Eroare la editare"); }
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteConversation(modalConv.id);
      if(response)
          setConversations(p => p.filter(c => c.id!==modalConv.id));
      closeModal();
    } catch { alert("Eroare la ștergere"); }
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      // Dacă meniul e deschis, iar click-ul nu e în interiorul meniului, îl închidem
      if (
        activeMenu !== null &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    }
  
    document.addEventListener("click", handleClickOutside);
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeMenu]);
  

  const today = new Date();
  const formattedDate = today
      .toLocaleDateString("ro-RO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
      .replace(/\b\w/, c => c.toUpperCase());

  const groupConversationsByDate = l => {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const g = { today: [], yesterday: [], previous7Days: [], older: [] };
    l.forEach(c => {
      const d = new Date(c.created_at);
      const diff = Math.floor((today - d) / 86400000);
      if (diff === 0) g.today.push(c);
      else if (diff === 1) g.yesterday.push(c);
      else if (diff <= 7) g.previous7Days.push(c);
      else g.older.push(c);
    });
    return g;
  };

  const cleanTitle = t => {
    if (!t) return "Fără titlu";
    const s = String(t).trim();
    if (!s) return "Fără titlu";
    if (/^\d+$/.test(s)) return "Fără titlu";
    return s;
  };

  const renderGroup = (title, list) =>
      list.length ? (
          <div className="conversation-group" key={title}>
            <div className="group-title">{title}</div>
            {list.map(conv => {
              const full = cleanTitle(conv.title);
              const disp = full.length > 20 ? full.slice(0,20)+"…" : full;
              const open = activeMenu === conv.id;

              return (
                <div
                className="conversation-wrapper"
                key={conv.id}
                ref={activeMenu === conv.id ? menuRef : null} // atașăm ref doar la conversația activă
                onClick={closeMenu}
              >
                <Link to={`/chat/${conv.id}`} className="conversation-item" title={full}>
                      <span className="conversation-title">{disp}</span>
                    </Link>

                    <button className="menu-btn" onClick={e=>{e.stopPropagation();toggleMenu(conv.id);}}>
                      <FaEllipsisH />
                    </button>

                    {open && (
                        <div className="menu-dropdown" onClick={e=>e.stopPropagation()}>
                          <button className="drop-item"    onClick={()=>openEdit(conv)}><FaPen/> Editează</button>
                          <button className="drop-item delete" onClick={()=>openDel(conv)}><FaTrash/> Șterge</button>
                        </div>
                    )}
                  </div>
              );
            })}
          </div>
      ) : null;



  useEffect(() => {
    const token =
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userId =
        localStorage.getItem("userId") || sessionStorage.getItem("userId");

    if (token && userId) {
      axios
          .get(`${API_URL}/users/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then(r => {
            setUserEmail(r.data.email);
            setUserInitial(r.data.email.charAt(0).toUpperCase());
          })
          .catch(() => {
            setUserEmail("unknown@example.com");
            setUserInitial("U");
          });
    }

    (async () => {
      const data = await getConversationHistory();
      setConversations(
          (data || []).sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
      );
    })();
  }, []);

  const filtered = conversations.filter(c => {
    if (
        searchTerm &&
        !(c.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (dateFilter) {
      const d = new Date(c.created_at).toISOString().split("T")[0];
      if (d !== dateFilter) return false;
    }
    return true;
  });

  const groups = groupConversationsByDate(filtered);

  const toggleSidebar = () => {
    if (isMobile) setIsMobileOpen(p => !p);
    else setIsCollapsed(p => !p);
  };

  const formatSelected = d =>
      new Date(d).toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

  return (
      <>
        {isMobile && !isMobileOpen && (
            <button className="mobile-toggle" onClick={() => setIsMobileOpen(true)}>
              <FaBars />
            </button>
        )}
        {isMobileOpen && (
            <div
                className="sidebar-overlay show"
                onClick={() => setIsMobileOpen(false)}
            />
        )}

        <div
            className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
                isMobileOpen ? "mobile-open" : ""
            }`}
        >
          <div className="sidebar-header">
          <div className="sidebar-logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
  {!isCollapsed && (
    <>
      <img src={logo} alt="Logo" className="logo" />
      <span className="logo-text">DOSETIMPEX</span>
    </>
  )}
  <button className="collapse-btn" onClick={(e) => {
    e.stopPropagation();  //oprește propagarea spre handleLogoClick
    toggleSidebar();      //execută doar funcția de toggle
  }}
>
    {isCollapsed && !isMobileOpen ? <FaBars /> : <FaChevronLeft />}
  </button>
</div>
          </div>

          <div className="sidebar-search">
            {isCollapsed ? (
                <button
                    className="search-icon-btn"
                    onClick={() => {
                      setIsCollapsed(false);
                      setTimeout(() => searchInputRef.current?.focus(), 310);
                    }}
                >
                  <FaSearch />
                </button>
            ) : (
                <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Căutare..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            )}
          </div>

          {!isCollapsed && (
              <div className="sidebar-conversations">
                <div className="current-date">{formattedDate}</div>

                <div className="conversations-header">
                  <p className="sidebar-section-title">Istoric</p>
                  <div className="header-actions">
                    {dateFilter && (
                        <button
                            className="selected-date"
                            onClick={() => setDateFilter("")}
                        >
                          {formatSelected(dateFilter)} ✕
                        </button>
                    )}

                    <button
                        className="date-btn"
                        onClick={() => {
                          dateInputRef.current?.showPicker?.();
                          dateInputRef.current?.focus();
                        }}
                    >
                      <FaRegCalendarAlt />
                    </button>

                    <input
                        ref={dateInputRef}
                        type="date"
                        className="picker-hidden"
                        value={dateFilter}
                        onChange={e => setDateFilter(e.target.value)}
                    />
                  </div>
                </div>

                {filtered.length ? (
                    <div className="conversations-list">
                      {renderGroup("Astăzi", groups.today)}
                      {renderGroup("Ieri", groups.yesterday)}
                      {renderGroup("Ultimele 7 zile", groups.previous7Days)}
                      {renderGroup("Mai vechi", groups.older)}
                    </div>
                ) : (
                    <p className="no-conversations">Nicio conversație găsită</p>
                )}
              </div>
          )}

          <Link to="/profile" className="sidebar-user">
            <div className="user-avatar">{userInitial}</div>
            {!isCollapsed && (
                <div className="user-info">
                  <div className="user-email">{userEmail}</div>
                </div>
            )}
          </Link>
        </div>

        {modalType && (
            <div className="modal-backdrop" onClick={closeModal}>
              <div className="modal-box" onClick={e=>e.stopPropagation()}>
                {modalType==="edit" && (
                    <>
                      <h4>Editează titlul</h4>
                      <input
                          className="modal-input"
                          value={editTitle}
                          onChange={e=>setEditTitle(e.target.value)}
                      />
                      <div className="modal-actions">
                        <button onClick={closeModal}>Anulează</button>
                        <button onClick={saveEdit}>Salvează</button>
                      </div>
                    </>
                )}
                {modalType==="delete" && (
                    <>
                      <h4>Ștergi conversația?</h4>
                      <div className="modal-actions">
                        <button onClick={closeModal}>Nu</button>
                        <button className="danger" onClick={confirmDelete}>Da</button>
                      </div>
                    </>
                )}
              </div>
            </div>
        )}

      </>
  );
}

export default Sidebar;
