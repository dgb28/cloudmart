import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import LoadingSpinner from "../LoadingSpinner";
import api from "../../config/axiosConfig";

const TicketStatus = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

const TicketDetails = ({ ticket }) => {
  const renderConversation = () => {
    if (!ticket.conversation) {
      return <p>No conversation available.</p>;
    }

    if (typeof ticket.conversation === "string") {
      try {
        const parsedConversation = JSON.parse(ticket.conversation);
        if (Array.isArray(parsedConversation)) {
          return parsedConversation.map((message, index) => (
            <li key={index} className="mb-1">
              <span className="font-semibold capitalize">
                {message.sender}:{" "}
              </span>
              {message.text}
            </li>
          ));
        }
      } catch (e) {
        console.error("Error parsing conversation:", e);
      }
      return <p>{ticket.conversation}</p>;
    }

    if (Array.isArray(ticket.conversation)) {
      return ticket.conversation.map((message, index) => (
        <li key={index} className="mb-1">
          <span className="font-semibold">{message.sender}: </span>
          {message.text}
        </li>
      ));
    }

    return <p>Conversation format not recognized.</p>;
  };

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-md">
      <h4 className="text-lg font-semibold mb-2">Conversation:</h4>
      <ul className="list-disc list-inside">{renderConversation()}</ul>
      {ticket.overallSentiment && (
        <p className="mt-2 font-semibold">
          Sentiment:
          <span
            className={`ml-2 px-2 py-1 rounded-full ${
              ticket.overallSentiment === "positive"
                ? "bg-green-100 text-green-800"
                : ticket.overallSentiment === "negative"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {ticket.overallSentiment}
          </span>
        </p>
      )}
    </div>
  );
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  ticketId,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full m-4">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-6">
          Are you sure you want to delete ticket #{ticketId}? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminTicketView = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = "/tickets";
      if (statusFilter !== "all") {
        url += `/status?status=${statusFilter}`;
      }
      const response = await api.get(url);
      setTickets(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to fetch tickets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTicketDetails = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  const handleDeleteTicket = async () => {
    if (!deletingTicket) return;

    setIsDeleting(true);
    try {
      await api.delete(`/tickets/${deletingTicket}`);
      setTickets(tickets.filter((ticket) => ticket.id !== deletingTicket));
      setDeletingTicket(null);
    } catch (err) {
      console.error("Error deleting ticket:", err);
      setError("Failed to delete ticket. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderTicketRow = (ticket) => (
    <React.Fragment key={ticket.id}>
      <tr>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          #{ticket.id}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(ticket.createdAt).toLocaleString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <TicketStatus status={ticket.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {ticket.overallSentiment && (
            <span
              className={`px-2 py-1 rounded-full ${
                ticket.overallSentiment === "positive"
                  ? "bg-green-100 text-green-800"
                  : ticket.overallSentiment === "negative"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {ticket.overallSentiment}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => toggleTicketDetails(ticket.id)}
            className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
          >
            {expandedTicket === ticket.id ? (
              <ChevronUp className="h-5 w-5 mr-1" />
            ) : (
              <ChevronDown className="h-5 w-5 mr-1" />
            )}
            <span>Details</span>
          </button>
          <button
            onClick={() => setDeletingTicket(ticket.id)}
            className="text-red-600 hover:text-red-900 inline-flex items-center"
          >
            <Trash2 className="h-5 w-5 mr-1" />
          </button>
        </td>
      </tr>
      {expandedTicket === ticket.id && (
        <tr>
          <td colSpan="5">
            <TicketDetails ticket={ticket} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="container mx-auto py-8 flex-grow">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <main className="container mx-auto py-8 flex-grow">
          <p className="text-red-500 text-center">{error}</p>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <select
            className="border rounded p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {tickets.length === 0 ? (
          <p className="text-gray-600">No tickets found.</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map(renderTicketRow)}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
      <ConfirmDeleteModal
        isOpen={!!deletingTicket}
        onClose={() => setDeletingTicket(null)}
        onConfirm={handleDeleteTicket}
        ticketId={deletingTicket}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminTicketView;
