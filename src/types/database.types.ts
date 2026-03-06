export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ChatMessage: {
        Row: {
          extraContent: string | null
          from: string | null
          id: number
          messageType: Database["public"]["Enums"]["postType"] | null
          reaction: Database["public"]["Enums"]["ReactionType"] | null
          text: string | null
          to: string | null
        }
        Insert: {
          extraContent?: string | null
          from?: string | null
          id?: number
          messageType?: Database["public"]["Enums"]["postType"] | null
          reaction?: Database["public"]["Enums"]["ReactionType"] | null
          text?: string | null
          to?: string | null
        }
        Update: {
          extraContent?: string | null
          from?: string | null
          id?: number
          messageType?: Database["public"]["Enums"]["postType"] | null
          reaction?: Database["public"]["Enums"]["ReactionType"] | null
          text?: string | null
          to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ChatMessage_from_fkey"
            columns: ["from"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ChatMessage_to_fkey"
            columns: ["to"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      comment: {
        Row: {
          authorId: string | null
          commentText: string | null
          extraContent: string | null
          id: number
          postid: string | null
        }
        Insert: {
          authorId?: string | null
          commentText?: string | null
          extraContent?: string | null
          id?: number
          postid?: string | null
        }
        Update: {
          authorId?: string | null
          commentText?: string | null
          extraContent?: string | null
          id?: number
          postid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_postid_fkey"
            columns: ["postid"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
        ]
      }
      commentReaction: {
        Row: {
          athorId: string | null
          commentId: number | null
          id: number
          reactionType: Database["public"]["Enums"]["ReactionType"] | null
        }
        Insert: {
          athorId?: string | null
          commentId?: number | null
          id?: number
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Update: {
          athorId?: string | null
          commentId?: number | null
          id?: number
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "commentReaction_athorId_fkey"
            columns: ["athorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commentReaction_commentId_fkey"
            columns: ["commentId"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
        ]
      }
      commentReply: {
        Row: {
          authorId: string | null
          commentId: number | null
          extraContent: string | null
          id: number
          mediaUrl: string | null
          text: string | null
        }
        Insert: {
          authorId?: string | null
          commentId?: number | null
          extraContent?: string | null
          id?: number
          mediaUrl?: string | null
          text?: string | null
        }
        Update: {
          authorId?: string | null
          commentId?: number | null
          extraContent?: string | null
          id?: number
          mediaUrl?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commentReply_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commentReply_commentId_fkey"
            columns: ["commentId"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          followed_id: string
          follower_id: string
        }
        Insert: {
          followed_id: string
          follower_id: string
        }
        Update: {
          followed_id?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          user_a: string
          user_b: string
        }
        Insert: {
          user_a: string
          user_b: string
        }
        Update: {
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          activity_from: string | null
          created_at: string
          id: number
          seen: boolean | null
          to: string | null
          type: Database["public"]["Enums"]["postType"] | null
        }
        Insert: {
          activity_from?: string | null
          created_at?: string
          id?: number
          seen?: boolean | null
          to?: string | null
          type?: Database["public"]["Enums"]["postType"] | null
        }
        Update: {
          activity_from?: string | null
          created_at?: string
          id?: number
          seen?: boolean | null
          to?: string | null
          type?: Database["public"]["Enums"]["postType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_activity_from_fkey"
            columns: ["activity_from"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_to_fkey"
            columns: ["to"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      post: {
        Row: {
          authorId: string
          content: string | null
          createdAt: string
          extraContent: string | null
          id: string
          mediaUrl: string | null
          postType: Database["public"]["Enums"]["postType"] | null
        }
        Insert: {
          authorId: string
          content?: string | null
          createdAt?: string
          extraContent?: string | null
          id?: string
          mediaUrl?: string | null
          postType?: Database["public"]["Enums"]["postType"] | null
        }
        Update: {
          authorId?: string
          content?: string | null
          createdAt?: string
          extraContent?: string | null
          id?: string
          mediaUrl?: string | null
          postType?: Database["public"]["Enums"]["postType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "Post_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      postReaction: {
        Row: {
          authorId: string | null
          id: number
          postId: string | null
          reactionType: Database["public"]["Enums"]["ReactionType"] | null
        }
        Insert: {
          authorId?: string | null
          id?: number
          postId?: string | null
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Update: {
          authorId?: string | null
          id?: number
          postId?: string | null
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "postReaction_authorId_fkey"
            columns: ["authorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postReaction_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
        ]
      }
      registrationcodes: {
        Row: {
          code: string | null
          created_at: string
          id: number
          profile: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: number
          profile?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: number
          profile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrationcodes_profile_fkey"
            columns: ["profile"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      Profile: {
        Row: {
          avatarUrl: string | null
          bannerUrl: string | null
          bio: string | null
          confirmedAccount: boolean | null
          createdAt: string | null
          email: string
          id: string
          password: string | null
          updatedAt: string | null
          username: string | null
        }
        Insert: {
          avatarUrl?: string | null
          bannerUrl?: string | null
          bio?: string | null
          confirmedAccount?: boolean | null
          createdAt?: string | null
          email: string
          id?: string
          password?: string | null
          updatedAt?: string | null
          username?: string | null
        }
        Update: {
          avatarUrl?: string | null
          bannerUrl?: string | null
          bio?: string | null
          confirmedAccount?: boolean | null
          createdAt?: string | null
          email?: string
          id?: string
          password?: string | null
          updatedAt?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      postType:
        | "post"
        | "image"
        | "video"
        | "market"
        | "gamePlayer"
        | "shortVideo"
      ReactionType:
        | "like"
        | "love"
        | "care"
        | "laugh"
        | "wow"
        | "sad"
        | "angry"
        | "gay"
        | "flower"
        | "boom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      postType: [
        "post",
        "image",
        "video",
        "market",
        "gamePlayer",
        "shortVideo",
      ],
      ReactionType: [
        "like",
        "love",
        "care",
        "laugh",
        "wow",
        "sad",
        "angry",
        "gay",
        "flower",
        "boom",
      ],
    },
  },
} as const
