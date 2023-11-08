import Router from "next/router";
import useRequest from "../../hooks/use-request";

function TicketShow({ ticket }) {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) => {
      console.log(order);
      Router.push("/orders/[orderId]", `/orders/${order.id}`);
    },
  });
  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price}</h4>
      {errors}
      {/* this is written this way so that doRequest does not receive event as props */}
      <button className="btn btn-primary" onClick={() => doRequest()}>
        Purchase
      </button>
    </div>
  );
}

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query; //this is coming from the name of the file
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
