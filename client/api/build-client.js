import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    //we are on the server
    return axios.create({
      // baseURL:
      //   "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      baseURL: "http://www.eds-emporium.shop/",
      headers: req.headers,
      //   headers: {
      //     host: "ticketing.dev",
      //   },
    });
  } else {
    //we are on the browser
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
