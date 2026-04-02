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
          chatId: string
          created_at: string
          extraContent: string | null
          from: string | null
          messageType: Database["public"]["Enums"]["postType"] | null
          reaction: Database["public"]["Enums"]["ReactionType"] | null
          text: string | null
          to: string | null
        }
        Insert: {
          chatId?: string
          created_at?: string
          extraContent?: string | null
          from?: string | null
          messageType?: Database["public"]["Enums"]["postType"] | null
          reaction?: Database["public"]["Enums"]["ReactionType"] | null
          text?: string | null
          to?: string | null
        }
        Update: {
          chatId?: string
          created_at?: string
          extraContent?: string | null
          from?: string | null
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
          commentAuthorId: string | null
          commentId: string
          commentText: string | null
          created_at: string
          extraContent: string | null
          postid: string | null
        }
        Insert: {
          commentAuthorId?: string | null
          commentId?: string
          commentText?: string | null
          created_at?: string
          extraContent?: string | null
          postid?: string | null
        }
        Update: {
          commentAuthorId?: string | null
          commentId?: string
          commentText?: string | null
          created_at?: string
          extraContent?: string | null
          postid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_commentAuthorId_fkey"
            columns: ["commentAuthorId"]
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
          commReactId: string
          created_at: string
          reactedComment: string | null
          reactionAuthorId: string | null
          reactionType: Database["public"]["Enums"]["ReactionType"] | null
        }
        Insert: {
          commReactId?: string
          created_at?: string
          reactedComment?: string | null
          reactionAuthorId?: string | null
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Update: {
          commReactId?: string
          created_at?: string
          reactedComment?: string | null
          reactionAuthorId?: string | null
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "commentReaction_reactedComment_fkey"
            columns: ["reactedComment"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["commentId"]
          },
          {
            foreignKeyName: "commentReaction_reactionAuthorId_fkey"
            columns: ["reactionAuthorId"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      commentReply: {
        Row: {
          commentReplyAuthorId: string | null
          commentReplyId: string
          created_at: string
          extraContent: string | null
          mediaUrl: string | null
          repliedComment: string | null
          text: string | null
        }
        Insert: {
          commentReplyAuthorId?: string | null
          commentReplyId?: string
          created_at?: string
          extraContent?: string | null
          mediaUrl?: string | null
          repliedComment?: string | null
          text?: string | null
        }
        Update: {
          commentReplyAuthorId?: string | null
          commentReplyId?: string
          created_at?: string
          extraContent?: string | null
          mediaUrl?: string | null
          repliedComment?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commentReply_repliedComment_fkey"
            columns: ["repliedComment"]
            isOneToOne: false
            referencedRelation: "comment"
            referencedColumns: ["commentId"]
          },
        ]
      }
      CommentReplyReaction: {
        Row: {
          commentReplyReacted: string | null
          commentReplyReactionAuthor: string | null
          CommentReplyReactionId: string
          created_at: string
          reactionType: Database["public"]["Enums"]["ReactionType"] | null
        }
        Insert: {
          commentReplyReacted?: string | null
          commentReplyReactionAuthor?: string | null
          CommentReplyReactionId?: string
          created_at?: string
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Update: {
          commentReplyReacted?: string | null
          commentReplyReactionAuthor?: string | null
          CommentReplyReactionId?: string
          created_at?: string
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "CommentReplyReaction_commentReplyReacted_fkey"
            columns: ["commentReplyReacted"]
            isOneToOne: false
            referencedRelation: "commentReply"
            referencedColumns: ["commentReplyId"]
          },
          {
            foreignKeyName: "CommentReplyReaction_commentReplyReactionAuthor_fkey"
            columns: ["commentReplyReactionAuthor"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      friendshipRequest: {
        Row: {
          accepted: boolean | null
          created_at: string
          id: number
          sender: string | null
          target: string | null
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string
          id?: number
          sender?: string | null
          target?: string | null
        }
        Update: {
          accepted?: boolean | null
          created_at?: string
          id?: number
          sender?: string | null
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendshipRequest_sender_fkey"
            columns: ["sender"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendshipRequest_target_fkey"
            columns: ["target"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
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
          generatedNavigation: string | null
          notificationId: string
          notificationType:
            | Database["public"]["Enums"]["notificationtype"]
            | null
          seen: boolean | null
          to: string | null
        }
        Insert: {
          activity_from?: string | null
          created_at?: string
          generatedNavigation?: string | null
          notificationId?: string
          notificationType?:
            | Database["public"]["Enums"]["notificationtype"]
            | null
          seen?: boolean | null
          to?: string | null
        }
        Update: {
          activity_from?: string | null
          created_at?: string
          generatedNavigation?: string | null
          notificationId?: string
          notificationType?:
            | Database["public"]["Enums"]["notificationtype"]
            | null
          seen?: boolean | null
          to?: string | null
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
          created_at: string
          extraContent: string | null
          id: string
          mediaUrl: string | null
          postType: Database["public"]["Enums"]["postType"] | null
        }
        Insert: {
          authorId: string
          content?: string | null
          created_at?: string
          extraContent?: string | null
          id?: string
          mediaUrl?: string | null
          postType?: Database["public"]["Enums"]["postType"] | null
        }
        Update: {
          authorId?: string
          content?: string | null
          created_at?: string
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
          created_at: string
          id: number
          reactedBy: string | null
          reactedPost: string | null
          reactionType: Database["public"]["Enums"]["ReactionType"] | null
        }
        Insert: {
          created_at?: string
          id?: number
          reactedBy?: string | null
          reactedPost?: string | null
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Update: {
          created_at?: string
          id?: number
          reactedBy?: string | null
          reactedPost?: string | null
          reactionType?: Database["public"]["Enums"]["ReactionType"] | null
        }
        Relationships: [
          {
            foreignKeyName: "postReaction_reactedBy_fkey"
            columns: ["reactedBy"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "postReaction_reactedPost_fkey"
            columns: ["reactedPost"]
            isOneToOne: false
            referencedRelation: "post"
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
          created_at: string
          dataDiNascita: string | null
          email: string | null
          giocattoloPreferito: string | null
          id: string
          locationId: string | null
          password: string | null
          tipoCuccia: Database["public"]["Enums"]["Lettino"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatarUrl?: string | null
          bannerUrl?: string | null
          bio?: string | null
          confirmedAccount?: boolean | null
          created_at?: string
          dataDiNascita?: string | null
          email?: string | null
          giocattoloPreferito?: string | null
          id?: string
          locationId?: string | null
          password?: string | null
          tipoCuccia?: Database["public"]["Enums"]["Lettino"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatarUrl?: string | null
          bannerUrl?: string | null
          bio?: string | null
          confirmedAccount?: boolean | null
          created_at?: string
          dataDiNascita?: string | null
          email?: string | null
          giocattoloPreferito?: string | null
          id?: string
          locationId?: string | null
          password?: string | null
          tipoCuccia?: Database["public"]["Enums"]["Lettino"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Lettino:
        | "Cuccia"
        | "Scatola"
        | "Cassetto dei calzini (scassinato)"
        | "Strada"
        | "Letto di umano (ospite)"
        | "Letto di umano (espropriato)"
        | "Divano"
        | "Sedia"
        | "Poltrona"
      notificationtype:
        | "friendRequestReceived"
        | "friendRequestAccepted"
        | "postCommented"
        | "commentReplied"
        | "postReacted"
        | "commentReacted"
      postType:
        | "post"
        | "image"
        | "video"
        | "market"
        | "gamePlayer"
        | "shortVideo"
        | "shareTextPost"
        | "shareImagePost"
        | "shareVideoPost"
        | "shareShortVideo"
        | "shareMarketPost"
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
      Lettino: [
        "Cuccia",
        "Scatola",
        "Cassetto dei calzini (scassinato)",
        "Strada",
        "Letto di umano (ospite)",
        "Letto di umano (espropriato)",
        "Divano",
        "Sedia",
        "Poltrona",
      ],
      notificationtype: [
        "friendRequestReceived",
        "friendRequestAccepted",
        "postCommented",
        "commentReplied",
        "postReacted",
        "commentReacted",
      ],
      postType: [
        "post",
        "image",
        "video",
        "market",
        "gamePlayer",
        "shortVideo",
        "shareTextPost",
        "shareImagePost",
        "shareVideoPost",
        "shareShortVideo",
        "shareMarketPost",
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
