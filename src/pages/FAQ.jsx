import React, { useRef, useState } from "react";

const FaqsCard = (props) => {
  const answerElRef = useRef();
  const [state, setState] = useState(false);
  const [answerH, setAnswerH] = useState("0px");
  const { faqsList, idx } = props;

  const handleOpenAnswer = () => {
    const answerElH = answerElRef.current.childNodes[0].offsetHeight;
    setState(!state);
    setAnswerH(`${answerElH + 20}px`);
  };

  return (
     <div
      className="space-y-2 mt-1 overflow-hidden border-b border-emerald-400"
      key={idx}
      onClick={handleOpenAnswer}
    >
      <h4 className="cursor-pointer pb-5 flex items-center justify-between text text-gray-700 font-medium">
        {faqsList.q}
        {state ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-emerald-400 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-emerald-400 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        )}
      </h4>
      <div
        ref={answerElRef}
        className="duration-300"
        style={state ? { height: answerH } : { height: "0px" }}
      >
        <div>
          <p className="text-gray-700">{faqsList.a}</p>
        </div>
      </div>
    </div>
  );
};

export default () => {
  const faqsList = [
    {
      q: "What is NDI Verifier?",
      a: "The NDI Verifier is an application used by organizations to store organization-specific proof templates, enabling individual organization verifiers to validate the organization verifiable credentials held by users in the Bhutan NDI Wallet.",
    },
    {
      q: "How to register on the NDI Verifier?",
      a: "To register on the NDI Verifier, the first step is to set up a PIN for the NDI Verifier app. The organization verifier must then possess an Access Credential issued by a specific organization, which is stored in the Bhutan NDI Wallet. This allows the user to log in using the “Login with Bhutan NDI” option in the NDI Verifier when the Bhutan NDI Wallet is on the same device. If the Access Credential is stored in the Bhutan NDI Wallet on a different device, the user can select the “Login with Other Device” option in the NDI Verifier to log in.",
    },
    {
      q: "Who can use the NDI Verifier?",
      a: "Only organizations registered with Bhutan NDI can use the NDI Verifier. Additionally, users within these organizations can access the NDI Verifier only if they have the Access Credential.",
    },
    {
      q: "How to get the access credential?",
      a: "Organization users will receive an email with a QR code. By scanning the QR code with the Bhutan NDI Wallet, they can obtain their access credentials.",
    },
    {
      q: "Do we need a Bhutan NDI app to use the NDI Verifier?",
      a: "Yes, to use the NDI Verifier, you will need the Bhutan NDI app, as it stores the login credentials required to access the NDI Verifier.",
    },
    {
      q: "Are there any fees associated with usage of NDI verifier?",
      a: "For now, there are no fees associated with the usage of the NDI Verifier. The service is currently provided free of charge for verifiable credential verification.",
    },
    {
      q: "Can I use the NDI Verifier wallet without active internet connection?",
      a: "NDI Verifier app requires active internet connection for seamless user experience.",
    },
    {
      q: "Can I use the NDI Verifier wallet on the web app/browser?",
      a: "No, you cannot use Bhutan NDI on a web app through a browser. Currently, the wallet is available on iOS/Android mobile devices.",
    },
  ];

  return (
    <section className="leading-relaxed max-w  mt-8 mx-4 px-1 md:px-4">
      <div className="space-y-2 text-center">
        <h3 className="text text-gray-800 font-semibold">
          Frequently Asked Questions
        </h3>
        <p className="text-gray-600 max-w-lg mx-auto text-sm">
          Answered all frequently asked questions, Still confused? feel free to
          contact us 1109.
        </p>
      </div>
      <div className="mt-10 max-w-xl mx-auto">
        {faqsList.map((item, idx) => (
          <FaqsCard idx={idx} faqsList={item} />
        ))}
      </div>
    </section>
  );
};
