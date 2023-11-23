

export const ReplyComponent = ({ reply, nestedReplies, addNestedReply, isLoading, postData, setNestedReplies, setIsLoading}) => {
    return (

                <div
                  className="bg-gray-800 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-semibold text-blue-400">
                      {reply.user}
                    </h3>
                    <button
                      onClick={() =>
                        addNestedReply(
                          postData.id,
                          reply.replyId,
                          setNestedReplies,
                          setIsLoading,
                          postData.forum
                        )
                      } // Pass the reply ID to the function
                      className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? "..." : "Generate Reply"}
                    </button>{" "}
                  </div>
                  <div
                    className="text-sm text-gray-300 mt-2"
                    dangerouslySetInnerHTML={{ __html: reply.msg }}
                  ></div>
                  {nestedReplies[reply.replyId] &&
                    nestedReplies[reply.replyId].map(
                      (nestedReply, nestedIndex) => (
                        <ReplyComponent key={nestedReply.replyId} 
                        reply={nestedReply}
                        nestedReplies={nestedReplies}
                        addNestedReply={addNestedReply}
                        isLoading={isLoading}
                        postData={postData}
                        setNestedReplies={setNestedReplies}
                        setIsLoading={setIsLoading} />
                      )
                    )}
                </div>
    );
  }