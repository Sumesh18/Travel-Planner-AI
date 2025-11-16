import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Literal, Optional, Any
from utils.config_loader import load_config
from langchain_groq import ChatGroq


class ConfigLoader:
    def __init__(self):
        print("Loading configuration...")
        self.config = load_config()

    def __getitem__(self, key):
        return self.config[key]

class ModelLoader(BaseModel):
    model_provider: Literal["groq"] = "groq"
    config: Optional[ConfigLoader] = Field(default=None, exclude=True)

    def model_post_init(self, __context__: Any) -> None:
        self.config = ConfigLoader()
    
    class Config:
        arbitrary_types_allowed = True

    def load_llm(self):
        print("Loading LLM model...")
        print("Provider:", self.model_provider)
        if(self.model_provider == "groq"):
            print("Loading Groq model...")
            groq_api_key = os.getenv("GROQ_API_KEY")
            model_name = self.config["llm"]["groq"]["model_name"]
            llm = ChatGroq(model=model_name, api_key=groq_api_key)

        return llm