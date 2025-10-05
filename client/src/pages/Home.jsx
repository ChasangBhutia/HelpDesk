import React from 'react'
import SideMenu from '../components/SideMenu'
import Navbar from '../components/Navbar'
import TicketList from '../components/Tickets/TicketList'
import AddTicket from '../components/Tickets/AddTicket'
import { useParams } from 'react-router-dom'
import AgentTicketList from '../components/Tickets/AgentTicketList'
import ResolvedTicketList from '../components/Tickets/ResolvedTicketList'
import TicketDetails from '../components/Tickets/TicketDetails'
import Dashboard from '../components/Dashboard'
import { useAuthContext } from '../context/AuthContext'
import AllAgentsList from '../components/Tickets/AllAgentsList'
import AllUsersList from '../components/Tickets/AllUsersList'

const Home = () => {

    const { section, ticketId } = useParams();

    const { user } = useAuthContext();


    return (
        <div className='w-full bg-gray-200 h-screen flex items-center justify-center'>
            <div className="w-full max-w-[1500px] h-[98%] min-w-[800px] m-auto grid grid-cols-[280px_1fr] grid-rows-[60px_1fr]">
                {/* Sidebar */}
                <aside className=" row-span-3">
                    <SideMenu />
                </aside>

                {/* Navbar */}
                <header >
                    <Navbar section={section} />
                </header>

                {/* Main Content */}
                <main className=" overflow-auto">
                    {(section && ticketId) ? (
                        <TicketDetails id={ticketId} />
                    ) : (
                        <>
                            {section === 'dashboard' && <Dashboard role={user.role} />}
                            {section === 'ticket-lists' && <TicketList section={section} />}
                            {section === 'add-ticket' && <AddTicket />}
                            {section === 'assigned-tickets' && <AgentTicketList section={section}/>}
                            {section === 'resolved-tickets' && <ResolvedTicketList />}
                            {(section === 'all-agents' && user.role === 'admin') && <AllAgentsList/>}
                            {(section === 'all-users' && user.role === 'admin') && <AllUsersList/>}
                        </>
                    )}

                </main>
            </div>
        </div >
    )
}

export default Home