import React, { useEffect, useState, useContext, useRef  } from "react";
import ResVaultSDK from "resvault-sdk";
import { fetchTransactionDetails } from "./utils/ResilientDB";
import { GlobalContext } from "../context/GlobalContext";
import { useParams,Link, useNavigate } from "react-router-dom";

const sdk = new ResVaultSDK();
const PollDetailPage = () => {
  const { transactionId } = useParams(); // Get the poll's transactionId from the URL
  const navigate = useNavigate(); // For navigation
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  // const {publicKey, setPublicKey} = useContext(GlobalContext);
  const sendpublicKey = sessionStorage.getItem('publicKey');
  const [receivekey, setreceivekey] = useState(null);
  const [VoteTransactionId, setVoteTransactionId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const sdkRef = useRef(sdk); // Ref to manage SDK instance
  const publicKey = sessionStorage.getItem('publicKey');


  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/polls/${transactionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch poll");
        }
        const data = await response.json();
        setPoll(data);
 
        // Check if the user has already voted
        //TODO: make sure the local publick key is correct 
        const voteCheckResponse = await fetch(`http://localhost:3000/api/vote/user/${publicKey}`);
        if (voteCheckResponse.ok) {
          const voteData = await voteCheckResponse.json();
          const hasVotedForThisPoll = voteData.some(
            (vote) => vote.Data.pollid === transactionId
          );
          setHasVoted(hasVotedForThisPoll);
        }

      } catch (error) {
        console.error("Failed to fetch poll:", error);
        setError("Unable to load poll. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [transactionId]);

useEffect(() => {
    console.log("My public key is",publicKey);
    }, [publicKey]);

    useEffect(() => {
      console.log("My sendpublicKey key is",publicKey);
      }, [sendpublicKey]);

  const handleVote = async () => {
    if (!selectedOption) {
      alert("Please select an option before voting.");
      return;
    }
  
    try {
        // Check if the user has already voted
        const voteCheckResponse = await fetch(`http://localhost:3000/api/vote/user/${publicKey}`);
        console.log("voteCheckResponse publicKey: ", publicKey);
        console.log("voteCheckResponse: ", voteCheckResponse);
        if (voteCheckResponse.ok) {
          const voteData = await voteCheckResponse.json();
          console.log("voteData: ", voteData);
          const hasVotedForThisPoll = voteData.some(
            (vote) => vote.Data.pollid === transactionId
          );
          console.log("hasVotedForThisPoll: ", hasVotedForThisPoll);
          setHasVoted(hasVotedForThisPoll);

          if (hasVotedForThisPoll) {
            alert("You have already voted for this poll!");
            return; // Exit to prevent further execution
          }
        }

      const pollData = {
        options: selectedOption,
        createdAt: new Date().toISOString(),
      };

      const transactionMessage = {
        type: "commit",
        direction: "commit",
        amount: "1",
        data: pollData,
        recipient: poll.publicKey,
      }; 
      setreceivekey(poll.publicKey);

      console.log("Submitting transaction:", transactionMessage);
      sdkRef.current.sendMessage(transactionMessage);
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("Failed to submit vote. Please try again.");
    }

  };

// Message Listener to Fetch Transaction ID
useEffect(() => {
  const messageHandler = async (event) => {
    const message = event.data;

    if (message.data?.success) {
      const txnId = message.data.data.postTransaction?.id;
      if (txnId) {
        console.log("Transaction ID received:", txnId);
        setVoteTransactionId(txnId);
        setHasVoted(true);
      }

      // try {
      //   const transactionDetails = await fetchTransactionDetails(txnId);
      //   if (transactionDetails?.publicKey) {
      //     // Store the fetched publicKey in sessionStorage
      //     sessionStorage.setItem('publicKey', transactionDetails.publicKey);
      //   }
      // } catch (error) {
      //   console.error("Error fetching transaction details:", error);
      // }
    } else {
      console.error("Message format invalid or success flag is false.");
    }
  };

  // Attach the message listener to the SDK
  sdkRef.current.addMessageListener(messageHandler);

  // Cleanup listener on component unmount
  return () => {
    sdkRef.current.removeMessageListener(messageHandler);
  };
}, []);


useEffect(() => {
  const storePollInMongoDB = async () => {
  //console.log("Start to store to mongodb");
  if (VoteTransactionId && hasVoted) {
    try {

      const voteData = {
        pollid: transactionId,
        options: selectedOption,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:3000/api/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            VoteTransactionId,
            sendpublicKey,
            receivekey,
            voteData,
          }),
        });

      if (response.ok) {
        setHasVoted(false);
        alert("Vote stored successfully in MongoDB!");
      } else {
        console.error("Failed to store Vote in MongoDB:", await response.text());
        alert("Failed to store Vote.");
      }
    } catch (error) {
      console.error("Error storing vote in MongoDB:", error);
    }
  }
  };

  storePollInMongoDB();

}, [VoteTransactionId]); 

const handleViewResults = () => {
  navigate(`/polls/result/${transactionId}`);
};


  if (loading)
    return <div className="flex items-center justify-center h-screen text-lg font-semibold">Loading poll...</div>;
  if (error) return <div className="text-center text-red-500 font-medium">{error}</div>;
  if (!poll) return <div className="text-center text-gray-500">No poll found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-center mb-4">{poll.pollData.topic}</h1>
      <p className="text-gray-600 text-center mb-6">{poll.pollData.description}</p>
      <form className="space-y-4">
        {poll.pollData.options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              id={`option-${index}`}
              name="poll-option"
              value={option}
              onChange={() => setSelectedOption(option)}
              className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-400"
              disabled={hasVoted} // Disable option selection if already voted
            />
            <label
              htmlFor={`option-${index}`}
              className="ml-3 text-gray-700 cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </form>
      {!hasVoted && (
        <button
          onClick={handleVote}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Submit Vote
        </button>
      )}
      {hasVoted && (
        <button
          onClick={handleViewResults}
          className="mt-6 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
        >
          View Results
        </button>
      )}
    </div>
  );
};
export default PollDetailPage;
